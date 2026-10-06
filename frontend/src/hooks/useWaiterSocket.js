// frontend/src/hooks/useWaiterSocket.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useWaiterSocket = (waiterId) => {
    const [socket, setSocket] = useState(null);
    const [assignedTables, setAssignedTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]); // Call Waiter alerts & Pickup banners

    // 1. Fetch tables assigned to this waiter from MongoDB
    const fetchAssignedTables = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/tables/assigned/${waiterId}`);
            setAssignedTables(res.data);
        } catch (err) {
            console.error('Error fetching assigned tables:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (waiterId) fetchAssignedTables();
    }, [waiterId]);

    // 2. Connect to Socket.io and listen for live events
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // Join room for waiters
        newSocket.emit('join_room', { role: 'Waiter', userId: waiterId });

        // Listener: Customer Pressed "Call Waiter"
        newSocket.on('waiter:call_alert', (data) => {
            setAlerts((prev) => [
                { id: Date.now(), type: 'CALL', message: data.message, tableNumber: data.tableNumber },
                ...prev,
            ]);
        });

        // Listener: Kitchen marked an item as "READY"
        newSocket.on('waiter:pickup_alert', (data) => {
            setAlerts((prev) => [
                { id: Date.now(), type: 'PICKUP', message: data.message, tableNumber: data.tableNumber },
                ...prev,
            ]);
            fetchAssignedTables(); // Refresh table status
        });

        // Listener: Customer requested checkout (Cash/Card)
        newSocket.on('payment:pending_alert', (data) => {
            setAlerts((prev) => [
                { id: Date.now(), type: 'PAYMENT', message: data.message, tableNumber: data.tableNumber, sessionId: data.sessionId },
                ...prev,
            ]);
            fetchAssignedTables();
        });

        return () => newSocket.close();
    }, [waiterId]);

    // Waiter action: Confirm Payment Collected & Close Session
    const confirmPayment = (sessionId, tableId, tableNumber) => {
        if (socket) {
            socket.emit('payment:confirm', { sessionId, tableId, tableNumber });
            // Remove alert and refresh tables
            setAlerts((prev) => prev.filter((a) => a.sessionId !== sessionId));
            fetchAssignedTables();
        }
    };

    const dismissAlert = (alertId) => {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    };

    return {
        assignedTables,
        loading,
        alerts,
        confirmPayment,
        dismissAlert,
        refreshTables: fetchAssignedTables,
    };
};