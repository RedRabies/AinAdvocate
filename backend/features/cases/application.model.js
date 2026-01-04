const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    proposedFee: {
        type: Number,
        required: true
    },
    message: {
        type: String
    },
    status: {
        type: String,
        enum: ['APPLIED', 'ACCEPTED', 'REJECTED'],
        default: 'APPLIED'
    },
    negotiationHistory: [{
        sender: { type: String, enum: ['LAWYER', 'CLIENT'] },
        amount: Number,
        message: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ caseId: 1, lawyerId: 1 }, { unique: true });

module.exports = mongoose.model('CaseApplication', applicationSchema);
