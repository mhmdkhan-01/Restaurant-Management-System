import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
    {
        tableNumber: { type: String, required: true, unique: true },
        qrCodeKey: { type: String, required: true, unique: true },
        assignedWaiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        isOccupied: { type: Boolean, default: false },
        activeSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Table', tableSchema);