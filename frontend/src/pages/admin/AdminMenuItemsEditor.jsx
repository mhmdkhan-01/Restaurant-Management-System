// frontend/src/pages/admin/AdminMenuItemsEditor.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminMenuItemsEditor = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [requiresCooking, setRequiresCooking] = useState(true);

    const fetchMenu = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/menu`),
                axios.get(`${API_URL}/categories`),
            ]);
            setItems(menuRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const payload = { title, description, category, basePrice, discountPercentage, requiresCooking };

        try {
            if (editingItem) {
                await axios.put(`${API_URL}/menu/${editingItem._id}`, payload);
            } else {
                await axios.post(`${API_URL}/menu`, payload);
            }
            setShowModal(false);
            resetForm();
            fetchMenu();
        } catch (err) {
            console.error('Error saving item:', err);
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Delete this menu item permanently?')) {
            try {
                await axios.delete(`${API_URL}/menu/${id}`);
                fetchMenu();
            } catch (err) {
                console.error('Error deleting item:', err);
            }
        }
    };

    const resetForm = () => {
        setTitle(''); setDescription(''); setCategory(''); setBasePrice(0);
        setDiscountPercentage(0); setRequiresCooking(true); setEditingItem(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black">Menu Items Catalog Editor</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Manage pricing, variants, discounts, and cookable flags.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <Plus size={16} /> Add New Menu Item
                </button>
            </div>

            {/* ITEMS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div
                        key={item._id}
                        className="p-4 rounded-2xl border shadow-sm flex flex-col justify-between space-y-3"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm">{item.title}</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingItem(item); setTitle(item.title); setDescription(item.description);
                                            setCategory(item.category?._id || ''); setBasePrice(item.basePrice);
                                            setDiscountPercentage(item.discountPercentage); setRequiresCooking(item.requiresCooking);
                                            setShowModal(true);
                                        }}
                                        className="p-1 text-gray-500 hover:text-black"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item._id)} className="p-1 text-rose-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] line-clamp-2 mt-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <span className="text-xs font-extrabold" style={{ color: 'var(--color-primary)' }}>
                                PKR {item.basePrice} {item.discountPercentage > 0 && <span className="text-rose-500">({item.discountPercentage}% OFF)</span>}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.requiresCooking ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {item.requiresCooking ? 'Cookable' : 'Direct Serve'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <h2 className="text-base font-bold">{editingItem ? 'Edit Item' : 'Create New Menu Item'}</h2>
                        <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Item Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                                    <option value="">Select Category...</option>
                                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Base Price (PKR)</label>
                                    <input type="number" required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="w-full mt-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label className="font-bold" style={{ color: 'var(--text-muted)' }}>Discount %</label>
                                    <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} className="w-full mt-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <input type="checkbox" id="cookable" checked={requiresCooking} onChange={(e) => setRequiresCooking(e.target.checked)} />
                                <label htmlFor="cookable" className="font-bold">Requires Cooking (Send to Kitchen Queue)</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 font-bold rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 font-bold text-white rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMenuItemsEditor;