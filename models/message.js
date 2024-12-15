const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    roomId: { type: String, required: true },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: { type: String, required: true },
    imageUrl: { type: String },
    thumbnailUrl: { type: String },
    timestamp: { type: Number, required: true },
    isReceived: { type: Boolean, required: true },
    isRead: { type: Boolean, required: true },
    isDeleted: { type: Boolean, required: true },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
