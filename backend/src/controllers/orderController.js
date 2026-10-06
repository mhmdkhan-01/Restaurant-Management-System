import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Session from '../models/Session.js';

export const getKitchenOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            'items.requiresCooking': true,
            'items.status': { $in: ['Pending', 'Cooking'] },
        }).populate('table', 'tableNumber');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const createOrder = async (req, res) => {
    try {
        const { tableId, items, subtotal } = req.body;

        // 1. Find or create an active dining session for this table
        let table = await Table.findById(tableId);
        if (!table) return res.status(404).json({ message: 'Table not found' });

        let session;
        if (table.activeSession) {
            session = await Session.findById(table.activeSession);
        }

        if (!session || session.status === 'Closed') {
            session = await Session.create({
                table: tableId,
                subtotal: subtotal || 0,
                totalAmount: subtotal || 0,
                status: 'Active',
            });

            table.isOccupied = true;
            table.activeSession = session._id;
            await table.save();
        } else {
            session.subtotal += subtotal || 0;
            session.totalAmount += subtotal || 0;
            await session.save();
        }

        // 2. Create the Order
        const newOrder = await Order.create({
            table: tableId,
            session: session._id,
            items,
            orderTotal: subtotal,
        });

        res.status(201).json({ order: newOrder, session });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: err.message });
    }
};