const mongoose = require('mongoose');

/**
 * Schema for a group in the application.
 * @typedef {Object} Group
 * @property {string} name - The name of the group.
 * @property {Array} members - The members of the group.
 * @property {ObjectId} creator - The creator of the group.
 */
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Group', groupSchema);