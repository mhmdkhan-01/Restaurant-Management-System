// frontend/src/pages/kitchen/KDSDashboard.jsx
import React, { useState } from 'react';
import { useKitchenSocket } from '../../hooks/useKitchenSocket';
const KDSDashboard = () => {
    const { kitchenOrders, loading, startCooking, markReady } = useKitchenSocket();
    const [confirmReadyItem, setConfirmReadyItem] = useState(null); // Item modal for double confirmation

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <p className="text-sm font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>
                    Connecting to Kitchen Queue...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
            {/* HEADER */}
            <header className="p-4 rounded-2xl mb-4 shadow-sm flex justify-between items-center border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div>
                    <h1 className="text-lg font-black uppercase tracking-wider">Kitchen Display System (KDS)</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing items requiring preparation
                    </p>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    {kitchenOrders.length} Active Tickets
                </div>
            </header>

            {/* KDS TICKET GRID */}
            {kitchenOrders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                        ✓ Kitchen queue is clear. No active pending orders.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {kitchenOrders.map((order) => {
                        // Filter only cookable items for KDS
                        const cookableItems = order.items.filter((i) => i.requiresCooking && i.status !== 'Ready');
                        if (cookableItems.length === 0) return null;

                        return (
                            <div
                                key={order._id}
                                className="rounded-2xl p-4 shadow-sm border flex flex-col justify-between space-y-3"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                            >
                                {/* Ticket Top Meta */}
                                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="text-base font-black" style={{ color: 'var(--color-primary)' }}>
                                        {order.table?.tableNumber || 'Table'}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-100 text-amber-700">
                                        Order #{order._id.slice(-4)}
                                    </span>
                                </div>

                                {/* Items Queue */}
                                <div className="space-y-3 flex-1">
                                    {cookableItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="p-2.5 rounded-xl border flex flex-col justify-between gap-2"
                                            style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start font-bold text-xs">
                                                    <span>
                                                        {item.quantity}x {item.itemTitle}
                                                    </span>
                                                    {item.variantName && (
                                                        <span className="text-[10px] font-semibold text-gray-500">
                                                            ({item.variantName})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Customer Special Requests Highlight */}
                                                {item.customerComment && (
                                                    <p className="text-[11px] font-bold mt-1 px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                                        ⚠️ Note: "{item.customerComment}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Item Status Actions */}
                                            <div className="pt-1">
                                                {item.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => startCooking(order._id, item._id, order.session)}
                                                        className="w-full py-2 text-xs font-bold rounded-lg text-white shadow-sm"
                                                        style={{ backgroundColor: 'var(--status-preparing)' }}
                                                    >
                                                        🍳 Start Cooking
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setConfirmReadyItem({
                                                                orderId: order._id,
                                                                itemId: item._id,
                                                                tableNumber: order.table?.tableNumber,
                                                                tableId: order.table?._id,
                                                                sessionId: order.session,
                                                                itemTitle: item.itemTitle,
                                                            })
                                                        }
                                                        className="w-full py-2 text-xs font-bold rounded-lg text-white shadow-sm animate-pulse"
                                                        style={{ backgroundColor: 'var(--status-ready)' }}
                                                    >
                                                        ✓ Mark as Ready
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* DOUBLE-CONFIRMATION SAFETY MODAL FOR MARKING READY */}
            {confirmReadyItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center space-y-4"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h2 className="text-base font-bold">Confirm Order Ready?</h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Are you sure <strong style={{ color: 'var(--color-primary)' }}>{confirmReadyItem.itemTitle}</strong> for{' '}
                            <strong>{confirmReadyItem.tableNumber}</strong> is ready for pickup? This will send an alert to the waiter.
                        </p>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setConfirmReadyItem(null)}
                                className="flex-1 py-2.5 text-xs font-bold rounded-xl border"
                                style={{ borderColor: 'var(--border-subtle)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    markReady(
                                        confirmReadyItem.orderId,
                                        confirmReadyItem.itemId,
                                        confirmReadyItem.tableNumber,
                                        confirmReadyItem.tableId,
                                        confirmReadyItem.sessionId,
                                        confirmReadyItem.itemTitle
                                    );
                                    setConfirmReadyItem(null);
                                }}
                                className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl shadow-md"
                                style={{ backgroundColor: 'var(--status-ready)' }}
                            >
                                Yes, Alert Waiter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KDSDashboard;