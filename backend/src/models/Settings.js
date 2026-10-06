import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        hotelName: { type: String, required: true, default: 'Al-Bukhari Grand' },
        logoUrl: { type: String, default: '' },
        cardTaxPercent: { type: Number, required: true, default: 5 },
        cashTaxPercent: { type: Number, required: true, default: 15 },
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        currency: { type: String, default: 'PKR' },
    },
    { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);