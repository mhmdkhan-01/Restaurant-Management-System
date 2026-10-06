import express from 'express';
import { forceCloseSession } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/:sessionId/force-close', forceCloseSession);

export default router;