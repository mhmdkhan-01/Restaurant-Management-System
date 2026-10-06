// frontend/src/pages/admin/AdminMainDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    DollarSign, ShoppingBag, Utensils, ArrowUpRight,
    Clock, Plus, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const AdminMainDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Live Analytics from Backend API
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/analytics/dashboard`);
            setAnalytics(res.data);
        } catch (err) {
            console.error('Error loading analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();

        // Listen for Socket.io events to refresh analytics live on new order or payment
        const socket = io(SOCKET_URL);
        socket.emit('join_room', { role: 'Manager' });

        socket.on('kitchen:new_order', () => fetchAnalytics());
        socket.on('order:item_updated', () => fetchAnalytics());
        socket.on('floor:table_freed', () => fetchAnalytics());

        return () => socket.close();
    }, []);

    if (loading && !analytics) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
                    Computing Real-time Financial Analytics...
                </p>
            </div>
        );
    }

    const { todayEarnings, totalOrdersCount, occupiedTables, totalTables, topItems, liveOrders } = analytics || {};

    return (
        <div className="space-y-6">
            {/* TOP GREETING BAR */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black">Good Morning, Admin! 👋</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Here is the live overview of your hotel & restaurant today.
                    </p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="p-2 rounded-xl border hover:bg-black/5 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    style={{ borderColor: 'var(--border-subtle)' }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Live
                </button>
            </div>

            {/* KPI METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Earnings Today */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Earnings Today</span>
                        <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h2 className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>
                            PKR {todayEarnings?.toLocaleString() || 0}
                        </h2>
                        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                            <ArrowUpRight size={14} /> Live calculated
                        </p>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Total Orders</span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <ShoppingBag size={18} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h2 className="text-xl font-black">{totalOrdersCount || 0}</h2>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Orders placed today</p>
                    </div>
                </div>

                {/* Occupied Tables */}
                <div className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Occupied Tables</span>
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                            <Utensils size={18} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h2 className="text-xl font-black">
                            {occupiedTables || 0} / {totalTables || 0}
                        </h2>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {Math.round(((occupiedTables || 0) / (totalTables || 1)) * 100)}% floor occupancy
                        </p>
                    </div>
                </div>
            </div>

            {/* TOP MOVING ITEMS & LIVE ORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Moving Menu Items */}
                <div className="p-5 rounded-2xl border shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-sm font-bold">Top Moving Items</h3>
                    {topItems && topItems.length > 0 ? (
                        <div className="space-y-3">
                            {topItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                                    <div>
                                        <h4 className="text-xs font-bold">{item.name}</h4>
                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.sold} items sold</p>
                                    </div>
                                    <span className="text-xs font-extrabold" style={{ color: 'var(--color-primary)' }}>
                                        PKR {item.revenue.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs italic py-4 text-center" style={{ color: 'var(--text-muted)' }}>No sales recorded yet today.</p>
                    )}
                </div>

                {/* Live Recent Orders Table */}
                <div className="lg:col-span-2 p-5 rounded-2xl border shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-sm font-bold">Live Orders Queue</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b uppercase text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                                <tr>
                                    <th className="py-2.5 px-3">Order #</th>
                                    <th className="py-2.5 px-3">Table</th>
                                    <th className="py-2.5 px-3">Items</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3">Payment</th>
                                    <th className="py-2.5 px-3">Total Bill</th>
                                    <th className="py-2.5 px-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                                {liveOrders && liveOrders.length > 0 ? (
                                    liveOrders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-black/5 transition-colors">
                                            <td className="py-3 px-3 font-bold">{ord.id}</td>
                                            <td className="py-3 px-3">{ord.table}</td>
                                            <td className="py-3 px-3">{ord.items} items</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ord.status === 'Preparing' || ord.status === 'Cooking' ? 'bg-amber-100 text-amber-700' :
                                                        ord.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                                                    }`}>
                                                    {ord.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-semibold">{ord.payment}</td>
                                            <td className="py-3 px-3 font-bold" style={{ color: 'var(--color-primary)' }}>PKR {ord.bill}</td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{ord.time}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-6 text-center italic" style={{ color: 'var(--text-muted)' }}>No live orders right now.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMainDashboard;