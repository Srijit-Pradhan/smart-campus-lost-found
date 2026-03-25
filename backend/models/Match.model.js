import mongoose from 'mongoose';

// The Match model stores potential and confirmed matches between a lost and found item
const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    imageScore: {
      type: Number, // Score from MobileNet (0 to 1)
      default: 0,
    },
    textScore: {
      type: Number, // Score from Fuse.js (0 to 1)
      default: 0,
    },
    finalScore: {
      type: Number, // Combined score: (imageScore * 0.7) + (textScore * 0.3)
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed'],
      default: 'pending', // Pending until the two users confirm the match
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model('Match', matchSchema);
export default Match;
