import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import Settings from './models/Settings.js';
import User from './models/User.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db';

const seedDatabase = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected. Clearing existing collection data...');

        // Clear existing data
        await Settings.deleteMany({});
        await User.deleteMany({});
        await Category.deleteMany({});
        await MenuItem.deleteMany({});
        await Table.deleteMany({});

        // 1. Seed Global Settings
        console.log('🌱 Seeding Global Branding & Taxes...');
        await Settings.create({
            hotelName: 'Al-Bukhari Grand',
            cardTaxPercent: 5,
            cashTaxPercent: 15,
            address: 'Murree Road, Rawalpindi',
            phone: '+92 51 111 222 333',
            currency: 'PKR',
        });

        // 2. Seed Staff Accounts
        console.log('🌱 Seeding Pakistani Staff Users...');
        const salt = await bcrypt.genSalt(10);
        const commonPassword = await bcrypt.hash('123456', salt);

        const adminUser = await User.create({
            name: 'Muhammad Khan',
            email: 'admin@albukhari.com',
            password: commonPassword,
            role: 'Admin',
        });

        const managerUser = await User.create({
            name: 'Tahmoor Sajid',
            email: 'manager@albukhari.com',
            password: commonPassword,
            role: 'Manager',
        });

        const waiter1 = await User.create({
            name: 'Ali Hassan',
            email: 'ali@albukhari.com',
            password: commonPassword,
            role: 'Waiter',
        });

        const waiter2 = await User.create({
            name: 'Usman Mir',
            email: 'usman@albukhari.com',
            password: commonPassword,
            role: 'Waiter',
        });

        await User.create({
            name: 'Master Chef Tariq',
            email: 'kitchen@albukhari.com',
            password: commonPassword,
            role: 'Kitchen',
        });

        // 3. Seed Categories
        console.log('🌱 Seeding Menu Categories...');
        const catDesi = await Category.create({ name: 'Desi Karahi & BBQ', displayOrder: 1 });
        const catRice = await Category.create({ name: 'Biryani & Rice', displayOrder: 2 });
        const catFastFood = await Category.create({ name: 'Burgers & Fast Food', displayOrder: 3 });
        const catDrinks = await Category.create({ name: 'Drinks & Beverages', displayOrder: 4 });
        const catDeals = await Category.create({ name: 'Midnight Deals', displayOrder: 5 });

        // 4. Seed Menu Items & Variants
        console.log('🌱 Seeding Pakistani Menu Catalog...');
        await MenuItem.create([
            {
                title: 'Chicken Mutton Karahi',
                description: 'Traditional wok-cooked karahi with fresh ginger, green chillies, and rich gravy.',
                pictureUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
                category: catDesi._id,
                discountPercentage: 10,
                requiresCooking: true,
                hasVariants: true,
                variants: [
                    { name: 'Half KG', price: 1100 },
                    { name: 'Full KG', price: 2100 },
                ],
            },
            {
                title: 'Chicken Peshawari Biryani',
                description: 'Fragrant basmati rice cooked with spiced chicken, plums, and aromatic herbs.',
                pictureUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
                category: catRice._id,
                discountPercentage: 0,
                requiresCooking: true,
                hasVariants: true,
                variants: [
                    { name: 'Single Plate', price: 420 },
                    { name: 'Double Family Plate', price: 780 },
                ],
            },
            {
                title: 'Crispy Zinger Burger',
                description: 'Crispy deep-fried chicken fillet topped with spicy mayo, cheddar cheese, and lettuce.',
                pictureUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                category: catFastFood._id,
                discountPercentage: 15,
                requiresCooking: true,
                hasVariants: true,
                variants: [
                    { name: 'Single Patty', price: 450 },
                    { name: 'Double Patty Deluxe', price: 650 },
                ],
            },
            {
                title: 'Chilled Gourmet Drinks',
                description: 'Refreshing carbonated sodas served iced.',
                pictureUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
                category: catDrinks._id,
                discountPercentage: 0,
                requiresCooking: false, // SKIPS KITCHEN (ROUTES DIRECTLY TO WAITER)
                hasVariants: true,
                variants: [
                    { name: 'Pepsi 350ml Can', price: 120 },
                    { name: 'Pepsi 1.5 Litre', price: 280 },
                    { name: 'Pakola 1.5 Litre', price: 260 },
                ],
            },
            {
                title: 'Midnight Special Combo',
                description: '1 Zinger Burger + 1 Regular Fries + 350ml Drink (Available after 12:00 AM).',
                pictureUrl: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=400',
                category: catDeals._id,
                discountPercentage: 20,
                requiresCooking: true,
                hasVariants: false,
                basePrice: 699,
                isTimeRestricted: true,
                availableFrom: '00:00',
                availableTo: '04:00',
            },
        ]);

        // 5. Seed Tables and Assign Waiters
        console.log('🌱 Seeding Restaurant Tables...');
        await Table.create([
            { tableNumber: 'Table 01', qrCodeKey: 'qr_tbl_01', assignedWaiter: waiter1._id },
            { tableNumber: 'Table 02', qrCodeKey: 'qr_tbl_02', assignedWaiter: waiter1._id },
            { tableNumber: 'Table 03', qrCodeKey: 'qr_tbl_03', assignedWaiter: waiter1._id },
            { tableNumber: 'Table 04', qrCodeKey: 'qr_tbl_04', assignedWaiter: waiter2._id },
            { tableNumber: 'Table 05', qrCodeKey: 'qr_tbl_05', assignedWaiter: waiter2._id },
            { tableNumber: 'Table 06', qrCodeKey: 'qr_tbl_06', assignedWaiter: waiter2._id },
            { tableNumber: 'Table 07 (VIP)', qrCodeKey: 'qr_tbl_07', assignedWaiter: waiter1._id },
        ]);

        console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('--------------------------------------------------');
        console.log('🔑 TEST LOGIN CREDENTIALS (All Passwords: 123456):');
        console.log('• Admin / Manager:  manager@albukhari.com');
        console.log('• Waiter 1 (Tables 1-3, 7): ali@albukhari.com');
        console.log('• Waiter 2 (Tables 4-6):   usman@albukhari.com');
        console.log('• Kitchen Display:          kitchen@albukhari.com');
        console.log('--------------------------------------------------\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();