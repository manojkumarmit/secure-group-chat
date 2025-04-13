const { Server } = require('socket.io');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const logger = require('../logger');

/**
 * Configure Socket.IO server with CORS support and create instance
 * io will be used throughout the application for real-time communication
 */
let io;

/**
 * Setup Socket.IO server with CORS support and create instance
 * io will be used throughout the application for real-time communication
 * @param {Object} server - The server object
 * @returns {Object} The Socket.IO server instance
 */
const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        logger.debug(`Socket connected: ${socket.id}`);

        // Join a specific group
        socket.on('joinGroup', (groupId) => {
            logger.debug(`Socket ${socket.id} joining group: ${groupId}`);
            socket.join(groupId);
        });

        // Leave a specific group
        socket.on('leaveGroup', (groupId) => {
            logger.debug(`Socket ${socket.id} leaving group: ${groupId}`);
            socket.leave(groupId);
        });

        // Handle chat messages within a group
        socket.on('chat message', async (data) => {
            logger.info(`Message received for group: ${data.groupId}`);

            // Save the message to the database
            const message = new Message({
                id: data.id,
                text: data.text,
                group: data.groupId,
                user: {
                    id: data.user.id, // Use the user's ObjectId
                    name: data.user.name,
                    email: data.user.email
                },
                type: data.type || 'text',
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
            });

            try {
                await message.save();
                logger.info('Message saved to database');

                // Emit the message to all clients in the group
                io.to(data.groupId).emit('chat message', {
                    ...data,
                    timestamp: message.createdAt,
                });
            } catch (error) {
                logger.error('Error saving message:', error);
            }
        });

        // Typing indicator within a group
        socket.on('user typing', (data) => {
            logger.debug(`Typing in group: ${data.groupId}`);
            socket.to(data.groupId).emit('user typing', { user: data.user, groupId: data.groupId });
        });

        // Read receipt within a group
        socket.on('read receipt', async (data) => {
            logger.info(`Read receipt in group: ${data.groupId}`);

            try {
                // Find the message by its custom string ID
                const message = await Message.findOne({ id: data.messageId });

                if (message) {
                    // Mark the message as read by the user
                    await message.markAsRead(data.user);

                    // Emit the read receipt to all clients in the group
                    io.to(data.groupId).emit('messageRead', {
                        messageId: data.messageId,
                        user: data.user,
                        groupId: data.groupId
                    });
                } else {
                    logger.error(`Message not found: ${data.messageId}`);
                }
            } catch (error) {
                logger.error('Error updating read receipt:', error);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = { setupSocket };