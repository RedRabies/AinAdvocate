const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    address: { type: String }, // New field
    bio: { type: String }, // New field
    role: { type: String, default: 'client' },
    isVerified: { type: Boolean, default: false }, // Email verification
    isBanned: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
