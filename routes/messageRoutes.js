import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/:room_id/sendmessage', authenticateToken, sendMessage);
router.get('/:room_id', authenticateToken, getMessages);

export default router;