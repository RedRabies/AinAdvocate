const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    },
    issuedTo: { // Client Name/Address snapshot
        name: String,
        email: String,
        address: String
    },
    payee: {
        name: String,
        email: String
    },
    issuedBy: { // Lawyer Name/Firm snapshot
        name: String,
        firm: String
    },
    amount: Number,
    date: {
        type: Date,
        default: Date.now
    },
    pdfUrl: { // Path to generated PDF
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
