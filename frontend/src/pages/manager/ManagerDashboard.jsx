// frontend/src/pages/manager/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminMainDashboard from '../admin/AdminMainDashboard';
import AdminWaitersManager from '../admin/AdminWaitersManager';
import AdminMenuItemsEditor from '../admin/AdminMenuItemsEditor';
import AdminTablesManager from '../admin/AdminTablesManager';
import TableQRPrinter from '../../components/manager/TableQRPrinter';
import '../../styles/theme.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'overview' | 'menu' | 'waiters' | 'qr' | 'settings'
    const [tables, setTables] = useState([]);
    const [waiters, setWaiters] = useState([]);
    const [settings, setSettings] = useState({ hotelName: 'Al-Bukhari Grand', cardTaxPercent: 5, cashTaxPercent: 15 });
    const [loading, setLoading] = useState(true);

    // Force close session state
    const [closeSessionModal, setCloseSessionModal] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [tablesRes, waitersRes, setRes] = await Promise.all([
                axios.get(`${API_URL}/tables`),
                axios.get(`${API_URL}/users/waiters`),
                axios.get(`${API_URL}/settings`),
            ]);

            setTables(tablesRes.data);
            setWaiters(waitersRes.data);
            if (setRes.data) setSettings(setRes.data);
        } catch (err) {
            console.error('Error loading manager dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Assign Waiter to Table
    const handleAssignWaiter = async (tableId, waiterId) => {
        try {
            await axios.put(`${API_URL}/tables/${tableId}/assign`, { waiterId });
            fetchDashboardData();
        } catch (err) {
            console.error('Error assigning waiter:', err);
        }
    };

    // Force Close Session
    const handleForceCloseSession = async (tableId, sessionId) => {
        try {
            await axios.post(`${API_URL}/sessions/${sessionId}/force-close`, { tableId });
            setCloseSessionModal(null);
            fetchDashboardData();
        } catch (err) {
            console.error('Error force closing session:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading Manager Portal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-200" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
            {/* SIDEBAR NAVIGATION (Dark Navy Style) */}
            <aside className="w-full md:w-64 p-5 flex flex-col justify-between border-r shadow-lg" style={{ backgroundColor: '#1C1827', color: '#FFFFFF' }}>
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                            HMS
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-wider uppercase text-white">{settings.hotelName}</h1>
                            <p className="text-[10px] text-gray-400">Hotel & Restaurant</p>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {[
                            { id: 'dashboard', label: '📊 Executive Dashboard' },
                            { id: 'overview', label: '🗺️ Live Floor Overview' },
                            { id: 'menu', label: '🍔 Menu Items Catalog' },
                            { id: 'waiters', label: '👥 Manage Waiters' },
                            { id: 'tables', label: '🪑 Dining Tables Setup' },
                            { id: 'qr', label: '🖨️ Printable QR Cards' },
                            { id: 'settings', label: '⚙️ Settings & Taxes' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2"
                                style={{
                                    backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                                    color: activeTab === tab.id ? '#FFFFFF' : '#A1A1AA',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-400">
                    <p>Logged in as: <strong className="text-white">Admin / Manager</strong></p>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD */}
                {activeTab === 'dashboard' && <AdminMainDashboard />}

                {/* TAB 2: LIVE FLOOR OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-extrabold">Live Floor & Table Sessions</h2>
                            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                {tables.filter((t) => t.isOccupied).length} / {tables.length} Occupied
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tables.map((table) => (
                                <div
                                    key={table._id}
                                    className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between space-y-3"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base font-bold">{table.tableNumber}</h3>
                                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                                Waiter: <strong style={{ color: 'var(--text-main)' }}>{table.assignedWaiter?.name || 'Unassigned'}</strong>
                                            </p>
                                        </div>
                                        <span
                                            className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                                            style={{
                                                backgroundColor: table.isOccupied ? 'var(--color-primary-light)' : 'var(--bg-canvas)',
                                                color: table.isOccupied ? 'var(--color-primary)' : 'var(--text-muted)',
                                            }}
                                        >
                                            {table.isOccupied ? 'Occupied' : 'Vacant'}
                                        </span>
                                    </div>

                                    {table.isOccupied && table.activeSession && (
                                        <div className="p-3 rounded-xl border text-xs space-y-2" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                                            <div className="flex justify-between">
                                                <span style={{ color: 'var(--text-muted)' }}>Live Bill:</span>
                                                <span className="font-extrabold" style={{ color: 'var(--color-primary)' }}>
                                                    PKR {table.activeSession.totalAmount || table.activeSession.subtotal || 0}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setCloseSessionModal({ tableId: table._id, sessionId: table.activeSession._id, tableNumber: table.tableNumber })}
                                                className="w-full py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                                            >
                                                ⚠️ Force Close Session
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: FULL MENU CATALOG EDITOR */}
                {activeTab === 'menu' && <AdminMenuItemsEditor />}

                {/* TAB 4: MANAGE WAITERS */}
                {activeTab === 'waiters' && <AdminWaitersManager />}
                {/* TAB 5: MANAGE DINING TABLES */}
                {activeTab === 'tables' && <AdminTablesManager />}
                {/* TAB 6: PRINTABLE QR CARDS */}
                {activeTab === 'qr' && <TableQRPrinter tables={tables} hotelName={settings.hotelName} />}

                {/* TAB 6: SETTINGS & TAXES */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-extrabold">Master Admin Settings & Taxes</h2>
                        <div className="p-5 rounded-2xl border space-y-4 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                            <div>
                                <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Hotel / Restaurant Name</label>
                                <input
                                    type="text"
                                    value={settings.hotelName}
                                    onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                                    className="w-full mt-1 p-2.5 text-xs rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Credit Card Tax %</label>
                                    <input
                                        type="number"
                                        value={settings.cardTaxPercent}
                                        onChange={(e) => setSettings({ ...settings, cardTaxPercent: Number(e.target.value) })}
                                        className="w-full mt-1 p-2.5 text-xs rounded-xl border font-bold text-emerald-600"
                                        style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Cash Tax %</label>
                                    <input
                                        type="number"
                                        value={settings.cashTaxPercent}
                                        onChange={(e) => setSettings({ ...settings, cashTaxPercent: Number(e.target.value) })}
                                        className="w-full mt-1 p-2.5 text-xs rounded-xl border font-bold text-amber-600"
                                        style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* FORCE CLOSE CONFIRMATION MODAL */}
            {closeSessionModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-base font-bold text-rose-600">⚠️ Force Close Session?</h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Are you sure you want to forcibly terminate the session for <strong>{closeSessionModal.tableNumber}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setCloseSessionModal(null)} className="flex-1 py-2.5 text-xs font-bold rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                                Cancel
                            </button>
                            <button
                                onClick={() => handleForceCloseSession(closeSessionModal.tableId, closeSessionModal.sessionId)}
                                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl shadow-md"
                            >
                                Yes, Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;