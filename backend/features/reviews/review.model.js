const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true,
        unique: true
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxLength: 500
    }
}, { timestamps: true });

// Prevent duplicate reviews for same case (Handled by caseId unique, but good to be explicit)
reviewSchema.index({ caseId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
