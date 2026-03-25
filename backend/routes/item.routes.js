import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItemStatus,
  getMyItems,
} from '../controllers/item.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../services/imageUpload.service.js';

const router = express.Router();

// Get all items and get single item are public routes
// Get all items and get single item are public routes
router.get('/', getItems);
// Private route to get all items of logged-in user
router.get('/me', protect, getMyItems);
router.get('/:id', getItemById);

// Create item requires token and 'image' file upload
router.post('/', protect, upload.single('image'), createItem);

// Update status requires token
router.put('/:id/status', protect, updateItemStatus);

export default router;
