import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (anyone can access these)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (you must send the JWT token in headers)
router.get('/profile', protect, getUserProfile);

export default router;
