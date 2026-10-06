// frontend/src/hooks/useKitchenSocket.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useKitchenSocket = () => {
    const [socket, setSocket] = useState(null);
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch active pending/cooking orders from MongoDB
    const fetchKitchenOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/orders/kitchen`);
            setKitchenOrders(res.data);
        } catch (err) {
            console.error('Error fetching kitchen queue:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitchenOrders();
    }, []);

    // 2. Connect to Socket.io and listen for incoming orders
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join_room', { role: 'Kitchen' });

        // Listener: New order ticket placed by customer
        newSocket.on('kitchen:new_order', () => {
            fetchKitchenOrders();
        });

        return () => newSocket.close();
    }, []);

    // Action: Start Cooking
    const startCooking = (orderId, itemId, sessionId) => {
        if (socket) {
            socket.emit('order:start_cooking', { orderId, itemId, sessionId });
            setKitchenOrders((prev) =>
                prev.map((order) => {
                    if (order._id === orderId) {
                        return {
                            ...order,
                            items: order.items.map((item) =>
                                item._id === itemId ? { ...item, status: 'Cooking' } : item
                            ),
                        };
                    }
                    return order;
                })
            );
        }
    };

    // Action: Mark as Ready (triggers Waiter pickup alert)
    const markReady = (orderId, itemId, tableNumber, tableId, sessionId, itemTitle) => {
        if (socket) {
            socket.emit('order:mark_ready', {
                orderId,
                itemId,
                tableNumber,
                tableId,
                sessionId,
                itemTitle,
            });

            // Remove completed item from KDS view or update status
            fetchKitchenOrders();
        }
    };

    return {
        kitchenOrders,
        loading,
        startCooking,
        markReady,
        refreshQueue: fetchKitchenOrders,
    };
};