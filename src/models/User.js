const mongoose = require('mongoose');

/**
 * Schema for a user in the application.
 * @typedef {Object} User
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String, // Optional: For user profile images
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);