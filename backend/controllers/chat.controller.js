import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import Match from '../models/Match.model.js';
import Item from '../models/Item.model.js';

// @desc    Initialize or get a chat room for a match
// @route   GET /api/chats/match/:matchId
// @access  Private
export const getOrCreateChat = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate('lostItemId foundItemId');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const user1Id = match.lostItemId.postedBy;
    const user2Id = match.foundItemId.postedBy;

    // Check if user is authorized 
    if (req.user.id !== user1Id.toString() && req.user.id !== user2Id.toString()) {
      return res.status(401).json({ message: 'Not authorized for this chat' });
    }

    // See if a chat already exists for this item
    // Note: We use the lost item ID as the anchor for the chat room
    let chat = await Chat.findOne({ 
      itemId: match.lostItemId._id,
      participants: { $all: [user1Id, user2Id] }
    });

    if (!chat) {
      chat = await Chat.create({
        itemId: match.lostItemId._id,
        participants: [user1Id, user2Id]
      });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Initialize or get a chat room for a specific item (direct contact)
// @route   POST /api/chats/item/:itemId
// @access  Private
export const getOrCreateChatByItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemOwnerId = item.postedBy.toString();
    const requesterId = req.user.id;

    if (itemOwnerId === requesterId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    let chat = await Chat.findOne({ 
      itemId: item._id,
      participants: { $all: [itemOwnerId, requesterId] }
    });

    if (!chat) {
      chat = await Chat.create({
        itemId: item._id,
        participants: [itemOwnerId, requesterId]
      });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat by item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Chat metadata by Chat ID
// @route   GET /api/chats/:chatId
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized for this chat' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error getting chat details' });
  }
};

// @desc    Get all messages for a specific chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized for this chat' });
    }

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 }); // Oldest first (for chat viewing)

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error getting messages' });
  }
};

// @desc    Send a new message
// @route   POST /api/chats/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to send messages here' });
    }

    const message = await Message.create({
      chatId,
      sender: req.user.id,
      content,
    });

    // Populate sender info before broadcasting
    await message.populate('sender', 'name');

    // Notify other users in the socket room
    req.io.to(chatId).emit('receive_message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get all active chats for the logged-in user
// @route   GET /api/chats
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name')
      .populate('itemId', 'title imageUrl type status')
      .sort({ updatedAt: -1 });
      
    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error fetching chats' });
  }
};
