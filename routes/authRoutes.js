import express from 'express';
import { handleLogin,handleRegister } from '../controllers/authController.js';
import { verifyAdmin } from '../middlewares/authMiddleware.js';
import { validateUserCreation } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/login',validateUserCreation, handleLogin);
router.post('/register', validateUserCreation ,handleRegister); // Only admin can register new users

export default router;
