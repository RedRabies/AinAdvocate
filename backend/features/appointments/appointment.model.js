const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'],
        default: 'PENDING'
    },
    reason: {
        type: String,
        trim: true
    },
    notes: { // Lawyer notes
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
