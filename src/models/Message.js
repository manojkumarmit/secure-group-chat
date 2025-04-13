const mongoose = require('mongoose');

/**
 * Schema for a user in the application.
 * @typedef {Object} User
 * @property {string} id - The ID of the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 */
const userSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId for user ID
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
}, { _id: false }); // Disable _id for subdocuments

const messageSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    group: {
        type: String, // Assuming group is a string identifier
        required: true,
    },
    user: userSchema, // Embed the user schema
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text',
    },
    mediaUrl: {
        type: String,
    },
    mediaType: {
        type: String,
    },
    readBy: [{
        type: String, // Use String to store user identifiers
    }],
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference User model
        ref: 'User',
    },
    edited: {
        type: Boolean,
        default: false,
    },
    editedAt: Date,
    replyTo: {
        type: String, // Assuming replyTo is a string identifier
    }
}, {
    timestamps: true,
});

messageSchema.index({ group: 1, createdAt: -1 });

messageSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toISOString();
});

messageSchema.methods.markAsRead = async function (userName) {
    if (userName && !this.readBy.includes(userName)) {
        this.readBy.push(userName);
        await this.save();
    }
};

messageSchema.methods.softDelete = async function (userId) {
    this.deleted = true;
    this.deletedBy = userId;
    await this.save();
};

messageSchema.methods.edit = async function (newText) {
    this.text = newText;
    this.edited = true;
    this.editedAt = new Date();
    await this.save();
};

module.exports = mongoose.model('Message', messageSchema);