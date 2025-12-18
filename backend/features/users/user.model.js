// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ['client', 'lawyer', 'admin'], default: 'client' },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  status: { type: String, enum: ['pending_verification', 'active', 'suspended'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
