// frontend/src/pages/customer/CustomerMenuPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomerSocket } from '../../hooks/useCustomerSocket';
const CustomerMenuPage = () => {
    const { tableId } = useParams(); // Reads table ID directly from URL scan
    const {
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
        placeOrder,
        taxRates,
        sessionStatus,
        paymentMethod,
        callWaiter,
        requestPayment,
    } = useCustomerSocket(tableId);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeItem, setActiveItem] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [customerComment, setCustomerComment] = useState('');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [callAlertSent, setCallAlertSent] = useState(false);

    // Dynamic category filtering
    const filteredItems = menuItems.filter((item) => {
        if (selectedCategory === 'All') return true;
        return item.category?._id === selectedCategory || item.category?.name === selectedCategory;
    });

    const handleAddToCart = async () => {
        if (!activeItem) return;

        const itemPrice = activeItem.hasVariants ? selectedVariant.price : activeItem.basePrice;
        const variantName = activeItem.hasVariants ? selectedVariant.name : '';

        const newItem = {
            menuItem: activeItem._id,
            itemTitle: activeItem.title, // Note: matched with Mongoose schema itemTitle
            title: activeItem.title,
            variantName,
            price: itemPrice,
            quantity: 1,
            customerComment,
            requiresCooking: activeItem.requiresCooking,
        };

        // 1. Update local cart state for instant UI feedback
        setCart((prev) => [...prev, newItem]);
        setActiveItem(null);
        setCustomerComment('');

        // 2. Instantly persist to MongoDB & emit Socket event
        try {
            await placeOrder([newItem]); // Pass newly added item to backend
        } catch (err) {
            console.error('Failed to post order item to server:', err);
        }
    };

    const handleCallWaiter = () => {
        callWaiter();
        setCallAlertSent(true);
        setTimeout(() => setCallAlertSent(false), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading Menu & Table Info...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <div className="p-5 rounded-2xl border max-w-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <h2 className="text-sm font-bold text-rose-500 mb-1">Invalid Session</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
            </div>
        );
    }

    // Update Finish Dining button action
    const handleFinishDining = async (mode) => {
        try {
            // 1. Save pending cart items to MongoDB first
            if (cart.length > 0) {
                await placeOrder();
            }
            // 2. Request Payment from Waiter
            requestPayment(mode);
            setShowCheckoutModal(false);
        } catch (err) {
            alert('Failed to process order. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pb-28 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
            {/* DYNAMIC HEADER */}
            <header className="sticky top-0 z-20 px-4 py-3 shadow-sm flex justify-between items-center border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div>
                    <h1 className="text-base font-bold">Al-Bukhari Grand</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Seated at <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{tableDetails?.tableNumber || 'Table'}</span>
                    </p>
                </div>
                <button
                    onClick={handleCallWaiter}
                    className="text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 active:scale-95"
                    style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                    {callAlertSent ? '✓ Alert Sent' : '🔔 Call Waiter'}
                </button>
            </header>

            {/* DYNAMIC CATEGORY SCROLLER */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all"
                    style={{
                        backgroundColor: selectedCategory === 'All' ? 'var(--color-primary)' : 'var(--bg-card)',
                        color: selectedCategory === 'All' ? '#FFFFFF' : 'var(--text-muted)',
                        border: `1px solid ${selectedCategory === 'All' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    }}
                >
                    All Items
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className="px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all"
                        style={{
                            backgroundColor: selectedCategory === cat._id ? 'var(--color-primary)' : 'var(--bg-card)',
                            color: selectedCategory === cat._id ? '#FFFFFF' : 'var(--text-muted)',
                            border: `1px solid ${selectedCategory === cat._id ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* DYNAMIC MENU ITEM LIST FROM MONGODB */}
            <div className="px-4 space-y-3 mt-1">
                {filteredItems.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => {
                            setActiveItem(item);
                            if (item.hasVariants && item.variants.length > 0) setSelectedVariant(item.variants[0]);
                        }}
                        className="rounded-xl p-3 shadow-sm flex gap-3 cursor-pointer active:scale-[0.99] transition-transform border"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        {item.pictureUrl && (
                            <img src={item.pictureUrl} alt={item.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-sm">{item.title}</h3>
                                    {item.discountPercentage > 0 && (
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                            {item.discountPercentage}% OFF
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {item.description}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                                    PKR {item.hasVariants ? item.variants[0]?.price : item.basePrice}{' '}
                                    {item.hasVariants && <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>onwards</span>}
                                </span>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                                    + Select
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ITEM POP-UP MODAL */}
            {activeItem && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end flex-col">
                    <div className="rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold">{activeItem.title}</h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{activeItem.description}</p>
                            </div>
                            <button onClick={() => setActiveItem(null)} className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>

                        {/* Dynamic Variant Selector */}
                        {activeItem.hasVariants && activeItem.variants?.length > 0 && (
                            <div className="mt-4">
                                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                    Select Option
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {activeItem.variants.map((v) => (
                                        <button
                                            key={v.name}
                                            onClick={() => setSelectedVariant(v)}
                                            className="p-2.5 rounded-lg text-left text-xs font-semibold flex justify-between items-center transition-all"
                                            style={{
                                                border: `1px solid ${selectedVariant?.name === v.name ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                                                backgroundColor: selectedVariant?.name === v.name ? 'var(--color-primary-light)' : 'transparent',
                                                color: selectedVariant?.name === v.name ? 'var(--color-primary)' : 'var(--text-main)',
                                            }}
                                        >
                                            <span>{v.name}</span>
                                            <span className="font-bold">PKR {v.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Request */}
                        <div className="mt-4">
                            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Special Requests / Comments
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Extra sauce, no onions..."
                                value={customerComment}
                                onChange={(e) => setCustomerComment(e.target.value)}
                                className="w-full mt-1.5 p-2.5 text-xs rounded-lg border focus:outline-none"
                                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setActiveItem(null)} className="flex-1 py-3 text-xs font-bold rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                                Cancel
                            </button>
                            <button onClick={handleAddToCart} className="flex-1 py-3 text-xs font-bold rounded-xl text-white shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* FINISH DINING MODAL & WAITER PENDING OVERLAY */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-base font-bold text-center">Finish Dining & Request Bill</h2>
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                            Choose your payment method. A waiter will come to your table to collect payment.
                        </p>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => { handleFinishDining('Card'); }}
                                className="w-full p-3 rounded-xl border flex justify-between items-center text-xs font-bold transition-all"
                                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
                            >
                                <span>💳 Pay via Card</span>
                                <span className="text-emerald-600 font-extrabold">+{taxRates.card}% Tax (PKR {subtotal + cardTax})</span>
                            </button>
                            <button
                                onClick={() => { handleFinishDining('Cash'); }}
                                className="w-full p-3 rounded-xl border flex justify-between items-center text-xs font-bold transition-all"
                                style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
                            >
                                <span>💵 Pay via Cash</span>
                                <span className="text-amber-600 font-extrabold">+{taxRates.cash}% Tax (PKR {subtotal + cashTax})</span>
                            </button>
                        </div>
                        <button onClick={() => setShowCheckoutModal(false)} className="w-full py-2.5 text-xs font-bold rounded-xl border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                            Back to Menu
                        </button>
                    </div>
                </div>
            )}

            {sessionStatus === 'PaymentPending' && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-3" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center animate-bounce" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                            ⏳
                        </div>
                        <h2 className="text-base font-bold">Waiting for Waiter</h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            You selected <strong style={{ color: 'var(--color-primary)' }}>{paymentMethod}</strong> payment. Your waiter is arriving shortly to collect <strong className="text-emerald-600">PKR {subtotal + (paymentMethod === 'Card' ? cardTax : cashTax)}</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* STICKY BOTTOM LIVE BILL BAR */}
            <div className="fixed bottom-0 inset-x-0 z-30 border-t p-3 shadow-2xl flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal: <strong style={{ color: 'var(--text-main)' }}>PKR {subtotal}</strong></span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Taxes: <span className="text-emerald-600 font-semibold">+{taxRates.card}% Card</span> | <span className="text-amber-600 font-semibold">+{taxRates.cash}% Cash</span>
                    </span>
                </div>
                <button
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={cart.length === 0}
                    className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Finish Dining ({cart.length} items) →
                </button>
            </div>
        </div>
    );
};

export default CustomerMenuPage;