const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    payerId: { // Client
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payeeId: { // Lawyer
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    method: {
        type: String, // 'CREDIT_CARD', 'BANK_TRANSFER', etc.
        default: 'MOCK'
    },
    transactionId: {
        type: String
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
