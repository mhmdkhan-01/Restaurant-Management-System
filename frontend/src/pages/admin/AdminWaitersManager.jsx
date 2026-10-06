// frontend/src/pages/admin/AdminWaitersManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Edit2, Trash2, Utensils, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminWaitersManager = () => {
    const [waiters, setWaiters] = useState([]);
    const [allTables, setAllTables] = useState([]);
    const [loading, setLoading] = useState(true);

    // Account Modal State
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [editingWaiter, setEditingWaiter] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Table Assignment Modal State
    const [assignModalWaiter, setAssignModalWaiter] = useState(null);
    const [selectedTableIds, setSelectedTableIds] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [waitersRes, tablesRes] = await Promise.all([
                axios.get(`${API_URL}/users/waiters`),
                axios.get(`${API_URL}/tables`),
            ]);
            setWaiters(waitersRes.data);
            setAllTables(tablesRes.data);
        } catch (err) {
            console.error('Error fetching waiters/tables:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open Add/Edit Account Modal
    const openAccountModal = (waiter = null) => {
        if (waiter) {
            setEditingWaiter(waiter);
            setName(waiter.name);
            setEmail(waiter.email);
            setPassword('');
            setIsActive(waiter.isActive ?? true);
        } else {
            setEditingWaiter(null);
            setName('');
            setEmail('');
            setPassword('');
            setIsActive(true);
        }
        setShowAccountModal(true);
    };

    // Open Table Assignment Modal
    const openAssignModal = (waiter) => {
        setAssignModalWaiter(waiter);
        // Pre-select tables currently assigned to this waiter
        const currentTableIds = allTables
            .filter((t) => t.assignedWaiter?._id === waiter._id || t.assignedWaiter === waiter._id)
            .map((t) => t._id);
        setSelectedTableIds(currentTableIds);
    };

    // Save Account (Add/Edit)
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        const payload = { name, email, password, isActive, role: 'Waiter' };

        try {
            if (editingWaiter) {
                await axios.put(`${API_URL}/users/${editingWaiter._id}`, payload);
            } else {
                await axios.post(`${API_URL}/users`, payload);
            }
            setShowAccountModal(false);
            fetchData();
        } catch (err) {
            console.error('Error saving waiter:', err);
        }
    };

    // Save Table Assignments
    const handleSaveTableAssignments = async () => {
        if (!assignModalWaiter) return;

        try {
            // Loop through all tables and update assignments
            await Promise.all(
                allTables.map((table) => {
                    const isSelected = selectedTableIds.includes(table._id);
                    const isCurrentlyAssignedToThisWaiter =
                        table.assignedWaiter?._id === assignModalWaiter._id || table.assignedWaiter === assignModalWaiter._id;

                    if (isSelected && !isCurrentlyAssignedToThisWaiter) {
                        // Assign table to this waiter
                        return axios.put(`${API_URL}/tables/${table._id}/assign`, { waiterId: assignModalWaiter._id });
                    } else if (!isSelected && isCurrentlyAssignedToThisWaiter) {
                        // Unassign table from this waiter
                        return axios.put(`${API_URL}/tables/${table._id}/assign`, { waiterId: null });
                    }
                    return Promise.resolve();
                })
            );

            setAssignModalWaiter(null);
            fetchData();
        } catch (err) {
            console.error('Error updating table assignments:', err);
        }
    };

    const handleDeleteWaiter = async (id) => {
        if (window.confirm('Are you sure you want to remove this waiter account? Assigned tables will be freed.')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchData();
            } catch (err) {
                console.error('Error deleting waiter:', err);
            }
        }
    };

    const toggleTableSelection = (tableId) => {
        setSelectedTableIds((prev) =>
            prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
        );
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black">Staff Waiters & Table Assignments</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Manage staff credentials, toggle active status, and assign dining floor tables.
                    </p>
                </div>
                <button
                    onClick={() => openAccountModal()}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <UserPlus size={16} /> Add New Waiter
                </button>
            </div>

            {/* WAITERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waiters.map((waiter) => {
                    const waiterTables = allTables.filter(
                        (t) => t.assignedWaiter?._id === waiter._id || t.assignedWaiter === waiter._id
                    );

                    return (
                        <div
                            key={waiter._id}
                            className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                        >
                            {/* TOP CARD DETAILS */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                                        style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                                    >
                                        {waiter.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{waiter.name}</h3>
                                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{waiter.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openAccountModal(waiter)}
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-black/5 transition-colors"
                                        title="Edit Credentials"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteWaiter(waiter._id)}
                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                        title="Delete Staff Account"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* ASSIGNED TABLES SECTION */}
                            <div className="p-3 rounded-xl border text-xs space-y-2" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                        Assigned Tables ({waiterTables.length}):
                                    </span>
                                    <button
                                        onClick={() => openAssignModal(waiter)}
                                        className="text-[11px] font-bold underline cursor-pointer"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        + Assign / Edit Tables
                                    </button>
                                </div>

                                {waiterTables.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {waiterTables.map((tbl) => (
                                            <span
                                                key={tbl._id}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                                                style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    borderColor: 'var(--border-subtle)',
                                                    color: 'var(--text-main)',
                                                }}
                                            >
                                                {tbl.tableNumber}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                                        No tables assigned yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACCOUNT EDIT / ADD MODAL */}
            {showAccountModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-base font-bold">
                            {editingWaiter ? `Edit ${editingWaiter.name}` : 'Add New Staff Waiter'}
                        </h2>

                        <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                                <input
                                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Tariq Ahmed" className="w-full mt-1 p-2.5 rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. tariq@albukhari.com" className="w-full mt-1 p-2.5 rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>
                                    Password {editingWaiter && <span className="font-normal italic">(Leave blank to keep unchanged)</span>}
                                </label>
                                <input
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder={editingWaiter ? '••••••••' : 'Enter password'} className="w-full mt-1 p-2.5 rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div className="flex gap-2 pt-3">
                                <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 py-2.5 font-bold rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 font-bold text-white rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {editingWaiter ? 'Update Account' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TABLE ASSIGNMENT MODAL */}
            {assignModalWaiter && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-base font-bold">Assign Tables to {assignModalWaiter.name}</h2>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Select floor tables assigned to this waiter.
                                </p>
                            </div>
                            <button onClick={() => setAssignModalWaiter(null)} className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {allTables.map((table) => {
                                const isSelected = selectedTableIds.includes(table._id);
                                const assignedOtherWaiter =
                                    table.assignedWaiter &&
                                    table.assignedWaiter._id !== assignModalWaiter._id &&
                                    table.assignedWaiter !== assignModalWaiter._id;

                                return (
                                    <button
                                        key={table._id}
                                        type="button"
                                        onClick={() => toggleTableSelection(table._id)}
                                        className="p-3 rounded-xl border text-left flex justify-between items-center transition-all"
                                        style={{
                                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-subtle)',
                                            backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-canvas)',
                                            color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                                        }}
                                    >
                                        <div>
                                            <p className="font-bold text-xs">{table.tableNumber}</p>
                                            {assignedOtherWaiter && (
                                                <p className="text-[10px] text-amber-600 font-semibold">
                                                    (Assigned to {table.assignedWaiter.name || 'other'})
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && <Check size={16} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setAssignModalWaiter(null)}
                                className="flex-1 py-2.5 text-xs font-bold rounded-xl border"
                                style={{ borderColor: 'var(--border-subtle)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTableAssignments}
                                className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl shadow-md"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                Save Assignments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWaitersManager;