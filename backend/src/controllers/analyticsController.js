import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Session from '../models/Session.js';

export const getDashboardAnalytics = async (req, res) => {
    try {
        // 1. Calculate Today's Earnings & Total Orders
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayOrders = await Order.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        const todayEarnings = todayOrders.reduce((sum, order) => sum + (order.orderTotal || 0), 0);
        const totalOrdersCount = todayOrders.length;

        // 2. Calculate Occupied Tables
        const totalTables = await Table.countDocuments();
        const occupiedTables = await Table.countDocuments({ isOccupied: true });

        // 3. Top Moving Menu Items Aggregation
        const topItemsAggregation = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.itemTitle',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { totalSold: -1 } }, { $limit: 4 },
        ]);

        // 4. Live Recent Orders
        const liveOrders = await Order.find()
            .populate('table', 'tableNumber')
            .populate('session', 'paymentMethod status')
            .sort({ createdAt: -1 })
            .limit(6);

        res.json({
            todayEarnings,
            totalOrdersCount,
            occupiedTables,
            totalTables,
            topItems: topItemsAggregation.map((item) => ({
                name: item._id,
                sold: item.totalSold,
                revenue: item.totalRevenue,
            })),
            liveOrders: liveOrders.map((ord) => ({
                id: `ORD-${ord._id.toString().slice(-4).toUpperCase()}`,
                table: ord.table?.tableNumber || 'N/A',
                items: ord.items.length,
                status: ord.items[0]?.status || 'Pending',
                payment: ord.session?.paymentMethod || 'Unpaid',
                bill: ord.orderTotal,
                time: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })),
        });
    } catch (err) {
        console.error('Analytics Fetch Error:', err);
        res.status(500).json({ message: 'Failed to compute live analytics' });
    }
};