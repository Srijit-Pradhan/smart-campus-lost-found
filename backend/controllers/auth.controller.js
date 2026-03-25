import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token is valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, collegeId } = req.body;

    // Allow any valid email format so external users can register too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rollNoRegex = /^\d{7}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format. Please enter a valid email address.' });
    }

    // College ID is optional, but if provided, must be valid 7-digit number
    if (collegeId && !rollNoRegex.test(collegeId)) {
      return res.status(400).json({ message: 'Invalid Roll Number. Must be exactly 7 digits (e.g., 2352125)' });
    }

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Hash the password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      collegeId,
    });

    // 4. Send back user data and token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        trustScore: user.trustScore,
        token: generateToken(user._id), // Give them a token straight after signing up
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await User.findOne({ email });

    // 2. Check if user exists and passwords match
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId,
        trustScore: user.trustScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (Requires token)
export const getUserProfile = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the result

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
