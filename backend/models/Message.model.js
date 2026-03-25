import mongoose from 'mongoose';

// The Message model stores individual messages within a specific Chat
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true, // The chat this message belongs to
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The user who sent the message
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false, // Useful for unread message notifications
    },
  },
  {
    timestamps: true, // The timestamp is used to order messages
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
