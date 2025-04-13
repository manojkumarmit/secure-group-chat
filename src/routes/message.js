const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const auth = require('../middleware/auth');
/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   get:
 *     summary: Get messages for a group
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: The number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Message ID
 *                       content:
 *                         type: string
 *                         description: Message content
 *                       sender:
 *                         type: string
 *                         description: ID of the message sender
 *                       group:
 *                         type: string
 *                         description: ID of the group
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Message creation timestamp
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Message update timestamp
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of messages
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *                     limit:
 *                       type: integer
 *                       description: Number of messages per page
 *       404:
 *         description: Group not found
 *       403:
 *         description: User is not a member of the group
 *       500:
 *         description: Failed to fetch messages
 */
router.get('/:groupId/messages', auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        const [messages, total] = await Promise.all([
            Message.find({
                group: groupId,
                deleted: false
            })
                // .populate('sender', 'name avatarUrl')
                // .populate('replyTo', 'content sender')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),

            Message.countDocuments({
                group: groupId,
                deleted: false
            })
        ]);

        // Mark messages as read for the current user
        await Promise.all(messages.map(message => message.readBy.includes(req.user.name) ? null : message.markAsRead(req.user.name)));

        res.json({
            messages,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * POST /api/groups/:groupId/messages
 * Send a new message to the group
 */
router.post('/:groupId/messages', auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, type = 'text', metadata, replyTo } = req.body;

        // Verify user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // If replying to a message, verify it exists and belongs to the group
        if (replyTo) {
            const parentMessage = await Message.findOne({
                _id: replyTo,
                group: groupId,
                deleted: false
            });
            if (!parentMessage) {
                return res.status(404).json({ error: 'Parent message not found' });
            }
        }

        const message = await Message.create({
            content,
            group: groupId,
            sender: req.user.id,
            readBy: [req.user.id],
            type,
            metadata,
            replyTo
        });

        // Populate sender and reply info before sending response
        await message.populate('sender', 'name avatarUrl');
        await message.populate('replyTo', 'content sender');

        // Emit socket event for real-time updates
        req.app.get('io').to(groupId).emit('newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

/**
 * PUT /api/groups/:groupId/messages/:messageId
 * Edit a message
 */
router.put('/:groupId/messages/:messageId', auth, async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findOne({
            _id: messageId,
            group: groupId,
            sender: req.user.id,
            deleted: false
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        await message.edit(content);
        await message.populate('sender', 'name avatarUrl');
        await message.populate('replyTo', 'content sender');

        // Emit socket event for real-time updates
        req.app.get('io').to(groupId).emit('messageEdited', message);

        res.json(message);
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ error: 'Failed to edit message' });
    }
});

/**
 * DELETE /api/groups/:groupId/messages/:messageId
 * Delete a message (soft delete)
 */
router.delete('/:groupId/messages/:messageId', auth, async (req, res) => {
    try {
        const { groupId, messageId } = req.params;

        const message = await Message.findOne({
            _id: messageId,
            group: groupId,
            sender: req.user.id,
            deleted: false
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        await message.softDelete(req.user.id);

        // Emit socket event for real-time updates
        req.app.get('io').to(groupId).emit('messageDeleted', {
            messageId,
            deletedBy: req.user.id
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

/**
 * POST /api/groups/:groupId/messages/:messageId/read
 * Mark a message as read
 */
router.post('/:groupId/messages/:messageId/read', auth, async (req, res) => {
    try {
        const { groupId, messageId } = req.params;

        // Verify user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await message.markAsRead(req.user.id);

        // Emit socket event for real-time updates
        req.app.get('io').to(groupId).emit('messageRead', {
            messageId,
            userId: req.user.id
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

module.exports = router; 