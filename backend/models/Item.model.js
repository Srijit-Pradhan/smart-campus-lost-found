import mongoose from 'mongoose';

// The Item model represents an item that is either "lost" or "found"
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Wallets & Bags', 'Keys', 'Documents', 'Clothing', 'Other'],
    },
    imageUrl: {
      type: String,
      required: true, // Every reported item must have a photo to allow AI matching
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found'], // Keeps track if it's a lost report or someone found it
    },
    location: {
      type: String,
      required: true, // Where it was lost or found on campus
    },
    date: {
      type: Date,
      required: true, // When the item was lost or found
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'claimed'],
      default: 'active',
    },
    embeddingVector: {
      type: [Number], // We store the AI generated feature vector of the image for matching
      // Not strictly required initially, some logic will insert it post image upload
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // References the User who created the report
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
