import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Config & DB
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { handleSocketEvents } from './sockets/socketHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
dotenv.config();

const app = express();
const server = http.createServer(app);

// MIDDLEWARES
app.use(cors({ origin: '*' }));
app.use(express.json());

// DATABASE CONNECTION
connectDB();

// SOCKET SETUP
const io = initSocket(server);
handleSocketEvents(io);

// MOUNT REST API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'HMS Server is running smoothly.' });
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});