// frontend/src/pages/waiter/WaiterDashboard.jsx
import React, { useState } from 'react';
import { useWaiterSocket } from '../../hooks/useWaiterSocket';
import '../../styles/theme.css';
const WaiterDashboard = ({ waiterId = 'waiter_1', waiterName = 'Ali Hassan' }) => {
    const { assignedTables, loading, alerts, confirmPayment, dismissAlert } = useWaiterSocket(waiterId);
    const [selectedTable, setSelectedTable] = useState(null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading assigned tables...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
            {/* MOBILE TOP BAR */}
            <header className="sticky top-0 z-20 px-4 py-3 shadow-sm flex justify-between items-center border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div>
                    <h1 className="text-base font-bold">Waiter Portal</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Logged in as: <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{waiterName}</span>
                    </p>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    {assignedTables.filter((t) => t.isOccupied).length} Active Tables
                </div>
            </header>

            {/* LIVE ALERTS FEED (CALL WAITER, KITCHEN PICKUP, PAYMENT) */}
            {alerts.length > 0 && (
                <div className="px-4 pt-3 space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="p-3 rounded-xl shadow-sm border flex justify-between items-center text-xs animate-bounce"
                            style={{
                                backgroundColor: alert.type === 'PAYMENT' ? '#FEF3C7' : alert.type === 'PICKUP' ? '#D1FAE5' : 'var(--color-primary-light)',
                                borderColor: 'var(--border-subtle)',
                            }}
                        >
                            <div>
                                <span className="font-extrabold uppercase mr-1">
                                    {alert.type === 'PAYMENT' ? '💵 PAYMENT' : alert.type === 'PICKUP' ? '🔔 PICKUP' : '📢 CALL'}:
                                </span>
                                <span>{alert.message}</span>
                            </div>
                            <button onClick={() => dismissAlert(alert.id)} className="font-bold text-sm px-2 text-gray-500">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ASSIGNED TABLES GRID */}
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
                {assignedTables.map((table) => (
                    <div
                        key={table._id}
                        onClick={() => setSelectedTable(table)}
                        className="p-4 rounded-2xl border shadow-sm cursor-pointer active:scale-95 transition-transform flex flex-col justify-between h-32"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: table.isOccupied ? 'var(--color-primary)' : 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <h2 className="text-base font-bold">{table.tableNumber}</h2>
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

                        {table.isOccupied && table.activeSession ? (
                            <div>
                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Current Bill:</p>
                                <p className="text-sm font-extrabold" style={{ color: 'var(--color-primary)' }}>
                                    PKR {table.activeSession.totalAmount || table.activeSession.subtotal || 0}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Ready for guests</p>
                        )}
                    </div>
                ))}
            </div>

            {/* TABLE DETAIL DRAWER MODAL */}
            {selectedTable && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end flex-col">
                    <div className="rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                            <div>
                                <h2 className="text-lg font-bold">{selectedTable.tableNumber} Overview</h2>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Status: {selectedTable.isOccupied ? 'Occupied' : 'Vacant'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedTable(null)} className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>

                        {selectedTable.isOccupied && selectedTable.activeSession ? (
                            <div className="mt-4 space-y-4">
                                {/* Active Orders Summary */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                        Session Orders & Status
                                    </h3>
                                    <div className="p-3 rounded-xl border space-y-2 text-xs" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                                        <div className="flex justify-between font-semibold border-b pb-1" style={{ borderColor: 'var(--border-subtle)' }}>
                                            <span>Payment Request Mode:</span>
                                            <span className="font-bold text-amber-600">{selectedTable.activeSession.paymentMethod || 'Pending'}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-sm pt-1">
                                            <span>Total Due:</span>
                                            <span style={{ color: 'var(--color-primary)' }}>PKR {selectedTable.activeSession.totalAmount || selectedTable.activeSession.subtotal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Payment Action Button */}
                                {selectedTable.activeSession.status === 'PaymentPending' && (
                                    <button
                                        onClick={() => {
                                            confirmPayment(selectedTable.activeSession._id, selectedTable._id, selectedTable.tableNumber);
                                            setSelectedTable(null);
                                        }}
                                        className="w-full py-3.5 text-xs font-extrabold text-white rounded-xl shadow-lg transition-all"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        ✓ Confirm Payment Received & Close Table
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                This table is currently vacant. No active session orders.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaiterDashboard;