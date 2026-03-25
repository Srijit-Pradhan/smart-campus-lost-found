import mongoose from 'mongoose';

// The User model stores details about each student using the system
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
      required: true, // Used to verify they belong to the campus
    },
    trustScore: {
      type: Number,
      default: 0, // Increases when they successfully return an item
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const User = mongoose.model('User', userSchema);
export default User;
