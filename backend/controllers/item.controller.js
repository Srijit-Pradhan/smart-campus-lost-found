import Item from '../models/Item.model.js';
import { uploadToImageKit } from '../services/imageUpload.service.js';
import { extractEmbedding, findMatches } from '../services/aiMatching.service.js';

// @desc    Get all active items (both lost and found)
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    
    // Build query based on filters
    const query = { status: 'active' };
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Populate postedBy to show the user's name
    const items = await Item.find(query)
      .populate('postedBy', 'name trustScore')
      .sort({ createdAt: -1 }); // Newest first

    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
};

// @desc    Get all items posted by the logged in user (both active and resolved)
// @route   GET /api/items/me
// @access  Private
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.id })
      .populate('postedBy', 'name trustScore')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Error fetching my items:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email trustScore');

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Server error fetching item' });
  }
};

// @desc    Create a new item report (lost or found)
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date } = req.body;

    // 1. Ensure an image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image of the item' });
    }

    // 2. Upload image to ImageKit
    const fileName = `item_${Date.now()}_${req.file.originalname}`;
    const imageUrl = await uploadToImageKit(req.file.buffer, fileName);

    // 3. Extract Image feature vector using AI
    const embeddingVector = await extractEmbedding(imageUrl);

    // 4. Create the item in the database
    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      imageUrl,
      embeddingVector,
      postedBy: req.user.id, // Comes from the protect middleware
    });

    // 5. In the background, trigger AI matching
    // We don't await this because we want to respond to the user quickly
    findMatches(item).catch(err => console.error("Match finding failed in background:", err));

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error creating item' });
  }
};

// @desc    Update item status (e.g. from active to resolved)
// @route   PUT /api/items/:id/status
// @access  Private
export const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // ensure only the creator can update the status
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this item' });
    }

    item.status = status;
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
};
