// frontend/src/pages/admin/AdminTablesManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Utensils, QrCode, CheckCircle2, Circle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminTablesManager = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [tableNumber, setTableNumber] = useState('');

    const fetchTables = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/tables`);
            setTables(res.data);
        } catch (err) {
            console.error('Error fetching tables:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!tableNumber.trim()) return;

        try {
            await axios.post(`${API_URL}/tables`, { tableNumber });
            setTableNumber('');
            setShowAddModal(false);
            fetchTables();
        } catch (err) {
            console.error('Error creating table:', err);
        }
    };

    const handleDeleteTable = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await axios.delete(`${API_URL}/tables/${id}`);
                fetchTables();
            } catch (err) {
                console.error('Error deleting table:', err);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black">Dining Tables Setup</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Add new physical tables or remove unneeded table numbers from the system.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <Plus size={16} /> Add New Table
                </button>
            </div>

            {/* TABLES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                    <div
                        key={table._id}
                        className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between space-y-3"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                                    style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                                >
                                    <Utensils size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm">{table.tableNumber}</h3>
                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        Waiter: <strong style={{ color: 'var(--text-main)' }}>{table.assignedWaiter?.name || 'Unassigned'}</strong>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Delete Table"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="p-2.5 rounded-xl border text-[11px] flex justify-between items-center" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                            <span className={`font-bold flex items-center gap-1 ${table.isOccupied ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {table.isOccupied ? 'Occupied' : 'Vacant'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD TABLE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-base font-bold">Add New Dining Table</h2>

                        <form onSubmit={handleAddTable} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Table Name / Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Table 08 or Outdoor Table 01"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full mt-1.5 p-2.5 rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 font-bold rounded-xl border"
                                    style={{ borderColor: 'var(--border-subtle)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 font-bold text-white rounded-xl shadow-md"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                    Create Table
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTablesManager;