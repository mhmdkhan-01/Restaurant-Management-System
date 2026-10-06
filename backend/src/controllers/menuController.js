import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ isAvailable: true }).populate('category');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createMenuItem = async (req, res) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.itemId);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};