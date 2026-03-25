import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import matchRoutes from './routes/match.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { initAIModel } from './services/aiMatching.service.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Setup Socket.io for Real-Time Chat
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for the hackathon (in production, specify your frontend URL)
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Attach socket.io to the request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chats', chatRoutes);

// Error Handling Middlewares (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize AI Model
    await initAIModel();
    
    // Start the server only after connecting to the DB
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific chat room based on itemId
  socket.on('join_room', (itemId) => {
    socket.join(itemId);
    console.log(`User ${socket.id} joined room ${itemId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
