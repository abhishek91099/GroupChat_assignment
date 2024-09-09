// routes/roomRoutes.js
import express from 'express';
import { validateRoomCreation } from '../middlewares/validationMiddleware.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../middlewares/authorizeAdmin.js';
import { createRoom, deleteRoom, addMemberToRoom, getRooms, removeMember } from '../controllers/roomController.js';

const router = express.Router();

// router.post('/rooms', authenticateToken, authorizeAdmin, createRoom);
// router.get('/getRooms', getRooms);
// router.delete('/rooms/:id', authenticateToken, authorizeAdmin, deleteRoom);
// router.post('/rooms/:id/members', authenticateToken, authorizeAdmin, addMemberToRoom);
router.post('/createRoom',authenticateToken,validateRoomCreation,createRoom);
router.get('/getRooms', getRooms);
router.delete('/:id/deleteRoom', authenticateToken,  deleteRoom);
router.post('/:id/addmembers', authenticateToken,  addMemberToRoom);
router.post('/:id/removeMember', authenticateToken,  removeMember);

export default router;
