import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'PaymentPending', 'Closed'],
            default: 'Active',
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'Pending'],
            default: 'Pending',
        },
        taxRateApplied: { type: Number, default: 0 }, // 5 for Card, 15 for Cash
        subtotal: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);