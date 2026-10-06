import User from '../models/User.js';
import Table from '../models/Table.js';
import bcrypt from 'bcryptjs';

// Get all waiters along with their currently assigned tables
export const getWaiters = async (req, res) => {
    try {
        const waiters = await User.find({ role: 'Waiter' }).select('-password').lean();

        // Attach assigned tables for each waiter
        const waitersWithTables = await Promise.all(
            waiters.map(async (waiter) => {
                const assignedTables = await Table.find({ assignedWaiter: waiter._id }).select('tableNumber isOccupied');
                return { ...waiter, assignedTables };
            })
        );

        res.json(waitersWithTables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new staff user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456', salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Waiter',
        });

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update staff user
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, isActive, role } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete staff user and unassign their tables
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await Table.updateMany({ assignedWaiter: userId }, { assignedWaiter: null });
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Staff account removed and tables unassigned successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};