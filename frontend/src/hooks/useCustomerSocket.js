// frontend/src/hooks/useCustomerSocket.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useCustomerSocket = (tableId) => {
    const [socket, setSocket] = useState(null);
    const [tableDetails, setTableDetails] = useState(null);
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sessionId, setSessionId] = useState(null);
    const [cart, setCart] = useState([]);
    const [sessionStatus, setSessionStatus] = useState('Active');
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [taxRates, setTaxRates] = useState({ card: 5, cash: 15 });

    // 1. Fetch live data from MongoDB via Express REST API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [tableRes, categoriesRes, menuRes, settingsRes] = await Promise.all([
                    axios.get(`${API_URL}/tables/${tableId}`),
                    axios.get(`${API_URL}/categories`),
                    axios.get(`${API_URL}/menu`),
                    axios.get(`${API_URL}/settings`),
                ]);

                setTableDetails(tableRes.data);
                setCategories(categoriesRes.data);
                setMenuItems(menuRes.data);
                if (settingsRes.data) {
                    setTaxRates({
                        card: settingsRes.data.cardTaxPercent,
                        cash: settingsRes.data.cashTaxPercent,
                    });
                }
                setSessionId(tableRes.data.activeSession?._id || null);
            } catch (err) {
                console.error('Error fetching initial menu data:', err);
                setError('Failed to load menu. Please scan QR code again or alert staff.');
            } finally {
                setLoading(false);
            }
        };

        if (tableId) {
            fetchInitialData();
        }
    }, [tableId]);

    // 2. Connect Socket.io for Real-Time Updates
    useEffect(() => {
        if (!tableId) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join_room', { role: 'Customer', tableId, sessionId });

        newSocket.on('session:status_changed', ({ status, paymentMethod }) => {
            setSessionStatus(status);
            setPaymentMethod(paymentMethod);
        });

        newSocket.on('session:closed', () => {
            setSessionStatus('Closed');
        });

        return () => newSocket.close();
    }, [tableId, sessionId]);

    // Dynamic calculations
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cardTax = subtotal * (taxRates.card / 100);
    const cashTax = subtotal * (taxRates.cash / 100);

    const callWaiter = () => {
        if (socket && tableDetails) {
            socket.emit('waiter:call', {
                tableId,
                tableNumber: tableDetails.tableNumber,
            });
        }
    };

    const requestPayment = (selectedMode) => {
        const tax = selectedMode === 'Card' ? cardTax : cashTax;
        const total = subtotal + tax;

        if (socket && tableDetails) {
            socket.emit('payment:request', {
                sessionId,
                tableId,
                tableNumber: tableDetails.tableNumber,
                paymentMethod: selectedMode,
                subtotal,
                taxAmount: tax,
                totalAmount: total,
            });
            setPaymentMethod(selectedMode);
            setSessionStatus('PaymentPending');
        }
    };
    // frontend/src/hooks/useCustomerSocket.js

    const placeOrder = async (itemsToSubmit) => {
        // Use passed items if provided, otherwise default to current cart state
        const targetItems = itemsToSubmit;

        if (!targetItems || targetItems.length === 0 || !tableId) return;

        const orderSubtotal = targetItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        try {
            // 1. Post ONLY the new items to backend
            const res = await axios.post(`${API_URL}/orders`, {
                tableId,
                items: targetItems,
                subtotal: orderSubtotal,
            });

            // 2. Broadcast socket event with ONLY these new items
            if (socket) {
                socket.emit('order:placed', {
                    tableId,
                    orderId: res.data.order._id,
                    items: targetItems,
                });
            }

            if (res.data.session?._id) {
                setSessionId(res.data.session._id);
            }

            // 3. Clear local cart so previously ordered items aren't resubmitted
            // setCart([]);

            return res.data;
        } catch (err) {
            console.error('Failed to place order:', err);
            throw err;
        }
    };

    return {
        tableDetails,
        categories,
        menuItems,
        loading,
        error,
        cart,
        setCart,
        subtotal,
        cardTax,
        cashTax,
        taxRates,
        sessionStatus,
        paymentMethod,
        callWaiter,
        requestPayment,
        placeOrder
    };
};