import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import User from './models/User.js';
import Project from './models/Project.js';
import Issue from './models/Issue.js';
import TestCase from './models/TestCase.js';
import Comment from './models/Comment.js';
import Team from './models/Team.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import issueRoutes from './routes/issues.js';
import testCaseRoutes from './routes/testCases.js';
import commentRoutes from './routes/comments.js';
import analyticsRoutes from './routes/analytics.js';
import teamRoutes from './routes/teams.js';
import invitationRoutes from './routes/invitations.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    await User.createTable();
    await Project.createTable();
    await Issue.createTable();
    await TestCase.createTable();
    await Comment.createTable();
    await Team.createTable();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/issues', issueRoutes);
app.use('/api/v1/projects/:projectId/issues/:issueId/comments', commentRoutes);
app.use('/api/v1/projects/:projectId/test-cases', testCaseRoutes);
app.use('/api/v1/projects/:projectId/analytics', analyticsRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/invitations', invitationRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('issue-update', (data) => {
    io.emit('issue-updated', data);
  });

  socket.on('comment-added', (data) => {
    io.emit('comment-added', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.SERVER_PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 API Version: v1`);
      console.log(`🗄️  Database: ${process.env.DB_NAME || 'bugme_db'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, httpServer, io };
