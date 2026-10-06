import express from 'express';
import { getWaiters, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/waiters', getWaiters);
router.post('/', createUser);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;