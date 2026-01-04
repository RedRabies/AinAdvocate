const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
    // Auth Fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'lawyer' },
    otp: { type: String },
    otpExpiry: { type: Date },

    // Profile Fields
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    location: { type: String },
    languages: [{ type: String }],
    categories: [{ type: String }], // e.g. ["Family", "Criminal"]
    specialization: [{ type: String }],
    licenseNumber: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false }, // OTP verification
    isVerified: { type: Boolean, default: false }, // Admin verification for practice
    isBanned: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', lawyerSchema);
