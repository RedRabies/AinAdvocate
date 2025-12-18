const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../features/users/user.model');

dotenv.config({ path: '../.env' }); // Adjust path if necessary, assuming run from backend/scripts

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ainadvocate');
        console.log('MongoDB Connected');

        const email = 'admin@ainadvocate.com';
        const password = 'admin123';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists.');
            // Optional: Update password if needed, but safer to skip
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: 'System Admin',
            email,
            passwordHash,
            role: 'admin',
            isVerified: true,
            status: 'active'
        });

        console.log('Admin User Created Successfully');
        console.log('Email:', email);
        console.log('Password:', password);

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
