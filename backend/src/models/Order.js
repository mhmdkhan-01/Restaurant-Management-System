import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    itemTitle: { type: String, required: true }, // Cached title
    variantName: { type: String, default: '' }, // e.g., "Large" or "1.5 Litre"
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    customerComment: { type: String, default: '' }, // e.g., "Extra spicy, no onions"
    requiresCooking: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['Pending', 'Cooking', 'Ready', 'Served'],
        default: 'Pending',
    },
});

const orderSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            required: true,
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
        },
        items: [orderItemSchema],
        orderTotal: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);