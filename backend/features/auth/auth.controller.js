// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../../features/users/user.model');
const Client = require('../../features/users/client.model');
const Lawyer = require('../../features/lawyers/lawyer.model');
const sendEmail = require('../../shared/utils/email.service');
const upload = require('../../shared/middlewares/upload.middleware');

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

exports.register = async (req, res) => {
  // validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  if (role === 'admin') {
    return res.status(403).json({ message: 'Admin registration is not allowed. Please contact support.' });
  }

  try {
    let existingClient = await Client.findOne({ email });
    let existingLawyer = await Lawyer.findOne({ email });
    let existingUser = await User.findOne({ email });

    // Cleanup unverified stale accounts
    if (existingClient && !existingClient.isVerified) {
      await Client.findByIdAndDelete(existingClient._id);
      existingClient = null;
    }
    if (existingLawyer && !existingLawyer.isVerified) {
      await Lawyer.findByIdAndDelete(existingLawyer._id);
      existingLawyer = null;
    }
    // (User model is legacy/admin, usually manually verified or seeded, skip auto-cleanup for safety or assume verified)

    if (existingClient || existingLawyer || existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let newUser;
    if (role === 'lawyer') {
      newUser = await Lawyer.create({
        name, email, passwordHash, role: 'lawyer', otp, otpExpiry,
        licenseNumber: 'PENDING',
        isEmailVerified: false, // OTP verification
        isVerified: false // Admin verification required
      });
    } else {
      newUser = await Client.create({
        name, email, passwordHash, role: 'client', otp, otpExpiry,
        isVerified: false
      });
    }

    // Send Real Email
    try {
      await sendEmail(email, 'Your OTP Code', `Your verification code is: ${otp}`);
    } catch (emailErr) {
      console.error(`[Auth] OTP Email failed for ${email}:`, emailErr.message);
      // Log more details if available
      if (emailErr.response) console.error(emailErr.response.body);
      // Rollback: Delete the user so they can try again
      if (role === 'lawyer') await Lawyer.findByIdAndDelete(newUser._id);
      else await Client.findByIdAndDelete(newUser._id);

      return res.status(500).json({ message: 'Failed to send OTP email. Please check your email address or contact support.' });
    }

    // DO NOT RETURN TOKEN. Require Verification.
    return res.status(201).json({
      message: 'Registration successful. Please check your email for the OTP code.',
      email: newUser.email,
      role: newUser.role
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    let user = await Client.findOne({ email });
    if (!user) user = await Lawyer.findOne({ email });
    if (!user) user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBanned) return res.status(403).json({ message: 'Account is banned' });

    // CHECK VERIFICATION
    // Admin (User model) might not need OTP, so check role or existence of isVerified field
    // CHECK VERIFICATION
    if (user.role === 'lawyer') {
      if (!user.isEmailVerified) return res.status(403).json({ message: 'Please verify your email address first.' });
      // We allow login even if !isVerified (Practice), so they can see "Pending" status on dashboard.
    } else if (user.role === 'client' && !user.isVerified) {
      // Clients use isVerified for email verification (legacy/standard flow)
      return res.status(403).json({ message: 'Please verify your email address first.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    // Include profileImage in response
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    let user = await Client.findOne({ email });
    if (!user) user = await Lawyer.findOne({ email });
    if (!user) user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'lawyer') {
      if (user.isEmailVerified) return res.status(400).json({ message: 'User already verified' });
      user.isEmailVerified = true;
      // Do NOT set isVerified = true. That is for Admin.
    } else {
      if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
      user.isVerified = true;
    }
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user);
    return res.json({
      message: 'Verification successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  // Middleware 'upload.single' should be used before this in route
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const user = req.user; // From verifyToken middleware
    // Depending on role, find and update
    // But req.user IS the mongoose document if verifyToken attached it?
    // verifyToken attaches fetched doc. So we can just save it.
    // Wait, verifyToken in auth.middleware attaches req.user.

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Image uploaded', profileImage: user.profileImage });

  } catch (err) {
    console.error('Upload Error:', err); // Log full error
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user = req.user;

    // Optional: Delete file from filesystem if you want to be clean
    // const fs = require('fs');
    // const path = require('path');
    // if (user.profileImage) { ... fs.unlink ... }

    user.profileImage = undefined; // or null
    await user.save();

    res.json({ message: 'Profile image removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user = req.user;

    // Optional: Delete file from filesystem if you want to be clean
    // const fs = require('fs');
    // const path = require('path');
    // if (user.profileImage) { ... fs.unlink ... }

    user.profileImage = undefined; // or null
    await user.save();

    res.json({ message: 'Profile image removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateMe = async (req, res) => {
  const { name, phone, address, bio } = req.body; // Added address, bio
  try {
    const user = req.user;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (bio) user.bio = bio;

    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const clients = await Client.find().select('-passwordHash');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id, type } = req.params;
  try {
    if (type === 'client') {
      await Client.findByIdAndDelete(id);
    } else if (type === 'lawyer') {
      await Lawyer.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.banUser = async (req, res) => {
  const { id, type } = req.params;
  try {
    let user;
    if (type === 'client') {
      user = await Client.findById(id);
    } else if (type === 'lawyer') {
      user = await Lawyer.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
