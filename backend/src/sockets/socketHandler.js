import Session from '../models/Session.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

export const handleSocketEvents = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join specific role/table rooms
        socket.on('join_room', (data) => {
            // data: { role: 'Admin'|'Manager'|'Waiter'|'Kitchen'|'Customer', tableId, sessionId }
            if (data.role === 'Kitchen') {
                socket.join('room:kitchen');
            } else if (data.role === 'Waiter') {
                socket.join('room:waiters');
            } else if (data.role === 'Manager' || data.role === 'Admin') {
                socket.join('room:manager');
            }

            if (data.sessionId) {
                socket.join(`room:session_${data.sessionId}`);
            }
            if (data.tableId) {
                socket.join(`room:table_${data.tableId}`);
            }
        });

        // CUSTOMER EVENT: Call Waiter
        socket.on('waiter:call', async (data) => {
            // data: { tableNumber, tableId }
            io.to('room:waiters').to('room:manager').emit('waiter:call_alert', {
                tableNumber: data.tableNumber,
                tableId: data.tableId,
                timestamp: new Date(),
                message: `Table ${data.tableNumber} requested a waiter!`,
            });
        });

        // Customer places order
        socket.on('order:placed', (data) => {
            io.to('room:kitchen').emit('kitchen:new_order', data);
            io.to('room:waiters').emit('waiter:new_order', data);
            io.to('room:manager').emit('floor:update', data);
        });

        // KITCHEN EVENT: Start Cooking an Item
        socket.on('order:start_cooking', async (data) => {
            // data: { orderId, itemId, sessionId }
            try {
                const order = await Order.findById(data.orderId);
                if (order) {
                    const item = order.items.id(data.itemId);
                    if (item) {
                        item.status = 'Cooking';
                        await order.save();

                        // Notify Customer & Manager
                        io.to(`room:session_${data.sessionId}`).to('room:manager').emit('order:item_updated', {
                            orderId: data.orderId,
                            itemId: data.itemId,
                            status: 'Cooking',
                        });
                    }
                }
            } catch (err) {
                console.error('Error starting cooking:', err);
            }
        });

        // KITCHEN EVENT: Mark Item as Ready (After Confirmation Modal)
        socket.on('order:mark_ready', async (data) => {
            // data: { orderId, itemId, tableNumber, tableId, sessionId, itemTitle }
            try {
                const order = await Order.findById(data.orderId);
                if (order) {
                    const item = order.items.id(data.itemId);
                    if (item) {
                        item.status = 'Ready';
                        await order.save();

                        // Broadcast urgent pickup alert to Waiters and update Customer view
                        io.to('room:waiters').emit('waiter:pickup_alert', {
                            tableNumber: data.tableNumber,
                            tableId: data.tableId,
                            itemTitle: item.itemTitle,
                            variantName: item.variantName,
                            quantity: item.quantity,
                            message: `${item.itemTitle} is READY for Table ${data.tableNumber}`,
                        });

                        io.to(`room:session_${data.sessionId}`).to('room:manager').emit('order:item_updated', {
                            orderId: data.orderId,
                            itemId: data.itemId,
                            status: 'Ready',
                        });
                    }
                }
            } catch (err) {
                console.error('Error marking ready:', err);
            }
        });

        // CUSTOMER EVENT: Finish Dining (Request Checkout & Payment Mode)
        socket.on('payment:request', async (data) => {
            // data: { sessionId, tableId, tableNumber, paymentMethod ('Cash'|'Card'), subtotal, taxAmount, totalAmount }
            try {
                const session = await Session.findById(data.sessionId);
                if (session) {
                    session.status = 'PaymentPending';
                    session.paymentMethod = data.paymentMethod;
                    session.subtotal = data.subtotal;
                    session.taxAmount = data.taxAmount;
                    session.totalAmount = data.totalAmount;
                    await session.save();

                    // Alert assigned Waiter & Floor Manager to collect cash/swipe card
                    io.to('room:waiters').to('room:manager').emit('payment:pending_alert', {
                        sessionId: data.sessionId,
                        tableNumber: data.tableNumber,
                        tableId: data.tableId,
                        paymentMethod: data.paymentMethod,
                        totalAmount: data.totalAmount,
                        message: `Table ${data.tableNumber} requested checkout via ${data.paymentMethod}. Collect: PKR ${data.totalAmount}`,
                    });

                    // Update customer UI state to "Waiting for Waiter Confirmation"
                    io.to(`room:session_${data.sessionId}`).emit('session:status_changed', {
                        status: 'PaymentPending',
                        paymentMethod: data.paymentMethod,
                    });
                }
            } catch (err) {
                console.error('Error in payment request:', err);
            }
        });

        // WAITER EVENT: Confirm Payment Received (Concludes Session)
        socket.on('payment:confirm', async (data) => {
            // data: { sessionId, tableId, tableNumber }
            try {
                const session = await Session.findById(data.sessionId);
                if (session) {
                    session.status = 'Closed';
                    session.endTime = new Date();
                    await session.save();

                    // Free up Table
                    await Table.findByIdAndUpdate(data.tableId, {
                        isOccupied: false,
                        activeSession: null,
                    });

                    // Emit session closed signal to Customer screen to display E-Receipt & Review Form
                    io.to(`room:session_${data.sessionId}`).emit('session:closed', {
                        sessionId: session._id,
                        receiptData: session,
                    });

                    // Update Manager Dashboard live floor map
                    io.to('room:manager').emit('floor:table_freed', {
                        tableId: data.tableId,
                        tableNumber: data.tableNumber,
                    });
                }
            } catch (err) {
                console.error('Error confirming payment:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};