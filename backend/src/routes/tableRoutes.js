import express from 'express';
import { getAllTables, getTableById, getAssignedTables, assignWaiter, createTable, deleteTable } from '../controllers/tableController.js';

const router = express.Router();

router.get('/', getAllTables);
router.post('/', createTable);
router.get('/:tableId', getTableById);
router.delete('/:tableId', deleteTable);
router.get('/assigned/:waiterId', getAssignedTables);
router.put('/:tableId/assign', assignWaiter);

export default router;