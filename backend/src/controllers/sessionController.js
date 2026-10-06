import Session from '../models/Session.js';
import Table from '../models/Table.js';

export const forceCloseSession = async (req, res) => {
    try {
        const { tableId } = req.body;
        const session = await Session.findByIdAndUpdate(
            req.params.sessionId,
            { status: 'Closed', endTime: new Date() },
            { new: true }
        );
        await Table.findByIdAndUpdate(tableId, { isOccupied: false, activeSession: null });
        res.json({ message: 'Session closed successfully', session });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};