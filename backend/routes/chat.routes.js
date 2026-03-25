import express from 'express';
import { getOrCreateChat, getOrCreateChatByItem, getChatById, getMessages, sendMessage, getUserChats } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all active chats for a user
router.get('/', protect, getUserChats);

// Get or initialize chat room via match ID
router.get('/match/:matchId', protect, getOrCreateChat);

// Get or initialize chat room directly via Item ID
router.post('/item/:itemId', protect, getOrCreateChatByItem);

// Get chat metadata by Chat ID
router.get('/:chatId', protect, getChatById);

// Get messages for a specific chat ID
router.get('/:chatId/messages', protect, getMessages);

// Send a new message to a specific chat ID
router.post('/:chatId/messages', protect, sendMessage);

export default router;
