import Match from '../models/Match.model.js';
import Item from '../models/Item.model.js';
import User from '../models/User.model.js';

// @desc    Get all active matches for the logged-in user's reported items
// @route   GET /api/matches
// @access  Private
export const getUserMatches = async (req, res) => {
  try {
    // 1. Find all items posted by this user (including active and resolved ones)
    const userItems = await Item.find({ postedBy: req.user.id });
    const userItemIds = userItems.map(item => item._id);

    // 2. Find any match where either the lost or found item belongs to this user
    const matches = await Match.find({
      $or: [
        { lostItemId: { $in: userItemIds } },
        { foundItemId: { $in: userItemIds } }
      ]
    })
      .populate({ path: 'lostItemId',  select: 'title imageUrl status postedBy', populate: { path: 'postedBy', select: 'name' } })
      .populate({ path: 'foundItemId', select: 'title imageUrl status postedBy', populate: { path: 'postedBy', select: 'name' } })
      .sort({ finalScore: -1 });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error fetching matches' });
  }
};

// @desc    Update a match status (Accept or Reject)
// @route   PUT /api/matches/:id/status
// @access  Private
export const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.status = status;
    const updatedMatch = await match.save();

    res.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: 'Server error updating match status' });
  }
};

// @desc    Loser confirms they received their item — triggers trustScore reward
// @route   PUT /api/matches/:id/confirm
// @access  Private (only the person who lost the item)
export const confirmReturn = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only the loser can confirm
    if (match.lostItemId.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the item owner can confirm return' });
    }

    if (!['pending', 'accepted'].includes(match.status)) {
      return res.status(400).json({ message: 'Match already confirmed or rejected' });
    }

    // Mark match as confirmed
    match.status = 'confirmed';
    await match.save();

    // Reward the finder with +1 trustScore
    await User.findByIdAndUpdate(match.foundItemId.postedBy, { $inc: { trustScore: 1 } });

    // Mark both items as resolved
    await Item.findByIdAndUpdate(match.lostItemId._id,  { status: 'resolved' });
    await Item.findByIdAndUpdate(match.foundItemId._id, { status: 'resolved' });

    res.json({ message: 'Return confirmed. Finder rewarded!' });
  } catch (error) {
    console.error('Error confirming return:', error);
    res.status(500).json({ message: 'Server error confirming return' });
  }
};
