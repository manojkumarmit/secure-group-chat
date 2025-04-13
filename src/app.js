const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group');
const messageRoutes = require('./routes/message');
const uploadRoutes = require('./routes/upload');
const logger = require('./logger');
const swaggerSpec = require('./swaggerConfig');
const { setupSocket } = require('./sockets/socketManager');

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);
app.set('io', io); // Make io instance available to routes

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Application Entry Point
 * 
 * This file sets up and starts the Express server, configures middleware, 
 * and initializes the Socket.IO server for real-time communication.
 * 
 * Key Components:
 * - Express: Web framework for handling HTTP requests and responses
 * - HTTP: Node.js module for creating an HTTP server
 * - CORS: Middleware for enabling Cross-Origin Resource Sharing
 * - Mongoose: ODM for MongoDB to interact with the database
 * - dotenv: Module to load environment variables from a .env file
 * - Routes: Modular route handlers for authentication, groups, messages, and file uploads
 * - Socket.IO: Real-time communication setup for handling WebSocket connections
 * 
 * Environment Variables Required:
 * - MONGO_URI: MongoDB connection string
 * - PORT: Port number for the server to listen on (default: 5000)
 * 
 * Security Features:
 * - CORS: Configured to allow cross-origin requests
 * - Authentication Middleware: Protects routes to ensure only authenticated users can access them
 * 
 * Error Handling:
 * - MongoDB Connection: Gracefully handles connection errors and exits the process if unable to connect
 * - Route Handlers: Catches and logs errors, sending appropriate HTTP responses
 * 
 * Real-Time Communication:
 * - Socket.IO: Configured to handle WebSocket connections for real-time updates
 * - io Instance: Made available to routes for emitting events
 * 
 * Usage:
 * - Start the server by running `node src/app.js`
 * - Access the API at `http://localhost:5000/api`
 * - Use the provided routes for authentication, group management, messaging, and file uploads
 */
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
startServer();