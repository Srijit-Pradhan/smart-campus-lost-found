import express from 'express';
import { getUserMatches, updateMatchStatus, confirmReturn } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get matches for the logged-in user
router.get('/', protect, getUserMatches);

// Update match status (e.g. accept or reject finding)
router.put('/:id/status', protect, updateMatchStatus);

// Loser confirms they received their item back → triggers trustScore reward
router.put('/:id/confirm', protect, confirmReturn);

export default router;
