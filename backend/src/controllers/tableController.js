import Table from '../models/Table.js';

export const getAllTables = async (req, res) => {
    try {
        const tables = await Table.find()
            .populate('assignedWaiter', 'name email')
            .populate('activeSession');
        res.json(tables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.tableId)
            .populate('assignedWaiter', 'name email')
            .populate('activeSession');
        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.json(table);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAssignedTables = async (req, res) => {
    try {
        const tables = await Table.find({ assignedWaiter: req.params.waiterId })
            .populate('activeSession');
        res.json(tables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Create a new table
export const createTable = async (req, res) => {
    try {
        const { tableNumber } = req.body;

        // Auto-generate a unique QR code key
        const qrCodeKey = `qr_tbl_${Date.now()}`;

        const newTable = await Table.create({
            tableNumber,
            qrCodeKey,
            isOccupied: false,
        });

        res.status(201).json(newTable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete table
export const assignWaiter = async (req, res) => {
    try {
        const { waiterId } = req.body;
        const table = await Table.findByIdAndUpdate(
            req.params.tableId,
            { assignedWaiter: waiterId || null },
            { new: true }
        ).populate('assignedWaiter', 'name email');
        res.json(table);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteTable = async (req, res) => {
    try {
        await Table.findByIdAndDelete(req.params.tableId);
        res.json({ message: 'Table removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};