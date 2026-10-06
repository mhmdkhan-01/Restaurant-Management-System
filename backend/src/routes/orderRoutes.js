import express from 'express';
import { getKitchenOrders, createOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/kitchen', getKitchenOrders);
router.post('/', createOrder);

export default router;