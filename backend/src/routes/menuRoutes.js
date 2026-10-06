import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenuItems);
router.post('/', createMenuItem);
router.put('/:itemId', updateMenuItem);
router.delete('/:itemId', deleteMenuItem);

export default router;