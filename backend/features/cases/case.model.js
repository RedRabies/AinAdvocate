const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    urgency: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'CLOSED', 'CANCELLED', 'REJECTED'],
        default: 'PENDING'
    },
    statusHistory: [{
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional, null for system/initial
    }],
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    assignedLawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        default: null
    },
    notes: [{
        noteText: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
