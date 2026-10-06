import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Small", "Medium", "1.5 Litre"
    price: { type: Number, required: true },
});

const menuItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        pictureUrl: { type: String, default: '' },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        discountPercentage: { type: Number, default: 0 }, // e.g. 10 for 10% OFF

        // Kitchen routing logic
        requiresCooking: { type: Boolean, default: true }, // Uncheck for drinks/pre-made items

        // Variant vs single pricing
        hasVariants: { type: Boolean, default: false },
        basePrice: { type: Number, default: 0 }, // Used if hasVariants is false
        variants: [variantSchema], // Array of sizes/portions with individual prices

        // Availability & Time-based Deals
        isAvailable: { type: Boolean, default: true },
        isTimeRestricted: { type: Boolean, default: false },
        availableFrom: { type: String, default: '00:00' }, // 24-hour format "HH:mm"
        availableTo: { type: String, default: '04:00' },
    },
    { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);