const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - creatorId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               creatorId:
 *                 type: string
 *                 description: ID of the group creator
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, async (req, res) => {
    const { name, creatorId } = req.body;
    const group = await Group.create({
        name,
        creator: creatorId,
        members: [creatorId],
    });
    res.status(201).json(group);
});

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Update group details
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of group member IDs
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth, async (req, res) => {
    const { name, members } = req.body;
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (name) group.name = name;
        if (members) group.members = members;
        await group.save();
        res.json(group);
    } catch (err) {
        console.error("Error updating group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Group ID
 *                   name:
 *                     type: string
 *                     description: Name of the group
 *                   creator:
 *                     type: string
 *                     description: ID of the group creator
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of group member IDs
 *       500:
 *         description: Internal server error
 */
router.get("/", auth, async (req, res) => {
    const groups = await Group.find();
    res.json(groups);
});

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Update group details
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of group member IDs
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth, async (req, res) => {
    const { name, members } = req.body;
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (name) group.name = name;
        if (members) group.members = members;
        await group.save();
        res.json(group);
    } catch (err) {
        console.error("Error updating group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/groups/my:
 *   get:
 *     summary: Get groups of the authenticated user
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups the user is a member of
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Group ID
 *                   name:
 *                     type: string
 *                     description: Name of the group
 *                   creator:
 *                     type: string
 *                     description: ID of the group creator
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of group member IDs
 *       500:
 *         description: Internal server error
 */
router.get("/my", auth, async (req, res) => {
    const userId = req.user.id; // from auth middleware
    const myGroups = await Group.find({ members: userId });
    res.json(myGroups);
});

/**
 * @swagger
 * /api/groups/{id}/join:
 *   post:
 *     summary: Allows a user to join a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     responses:
 *       200:
 *         description: User joined the group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/join", auth, async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group.members.includes(req.user.id)) {
        group.members.push(req.user.id);
        await group.save();
    }
    res.json(group);
});

/**
 * @swagger
 * /api/groups/{id}/leave:
 *   post:
 *     summary: Allows a user to leave a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     responses:
 *       200:
 *         description: User left the group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       403:
 *         description: Owner must transfer ownership before leaving
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/leave", auth, async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (!group.creator) {
        return res.status(400).json({ error: 'Group creator information is missing' });
    }
    group.members = group.members.filter(id => id.toString() !== req.user.id);
    await group.save();
    res.json(group);
});

/**
 * @swagger
 * /api/groups/{id}/addMember:
 *   post:
 *     summary: Add a new member to a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to be added
 *     responses:
 *       200:
 *         description: User added to the group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/addMember", auth, async (req, res) => {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
        return res.status(400).json({ message: "User is already a member of the group" });
    }
    group.members.push(userId);
    await group.save();
    res.json(group);
});

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     responses:
 *       204:
 *         description: Group deleted successfully
 *       403:
 *         description: Only the owner can delete the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth, async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (!group.creator) {
        return res.status(400).json({ error: 'Group creator information is missing' });
    }
    if (group.creator.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }
    await Group.deleteOne({ _id: req.params.id });
    res.status(204).end();
});

/**
 * @swagger
 * /api/groups/{id}/transfer:
 *   post:
 *     summary: Transfer ownership of a group to a new user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *                 description: ID of the new owner
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Group ID
 *                 name:
 *                   type: string
 *                   description: Name of the group
 *                 creator:
 *                   type: string
 *                   description: ID of the new group creator
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of group member IDs
 *       400:
 *         description: Bad request
 *       403:
 *         description: Only owner can transfer ownership
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/transfer", auth, async (req, res) => {
    const { newOwnerId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (!group.creator) {
        return res.status(400).json({ error: 'Group creator information is missing' });
    }
    if (group.creator.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }
    group.creator = newOwnerId;
    await group.save();
    res.json(group);
});

module.exports = router;