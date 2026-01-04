const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    sender: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ['client', 'lawyer'], required: true },
        name: { type: String } // Optional: Cache name for faster display
    },
    message: {
        type: String,
        trim: true
    },
    files: [{
        url: { type: String },
        type: { type: String }, // 'image', 'pdf', 'doc', etc.
        name: { type: String },
        size: { type: Number }
    }],
    readBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId },
        readAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
