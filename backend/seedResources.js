const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resource = require('../features/resources/resource.model');
const User = require('../features/users/user.model');

dotenv.config({ path: '../.env' });

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ainadvocate');
        console.log('MongoDB Connected');

        // Find an admin or any user to assign as 'addedBy'
        const admin = await User.findOne({ role: 'admin' });
        const addedBy = admin ? admin._id : null;

        const sampleResources = [
            {
                title: 'Understanding Bangladesh Labor Law 2006',
                category: 'Labor Law',
                content: 'A comprehensive guide to the rights and obligations of employers and workers...',
                url: 'https://example.com/labor-law-pdf',
                language: 'English',
                addedBy
            },
            {
                title: 'Family Court Ordinance 1985 Guide',
                category: 'Family Law',
                content: 'Explanation of family court procedures for divorce and child custody...',
                url: 'https://example.com/family-court-guide',
                language: 'English',
                addedBy
            },
            {
                title: 'Land Registration Process',
                category: 'Property Law',
                content: 'Step-by-step guide to registering land deeds in Bangladesh...',
                language: 'Bengali',
                addedBy
            },
            {
                title: 'Consumer Rights Protection Act 2009',
                category: 'Consumer Law',
                content: 'Know your rights as a consumer and how to file a complaint...',
                language: 'English',
                addedBy
            }
        ];

        await Resource.insertMany(sampleResources);
        console.log('Sample Resources Seeded Successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding resources:', err);
        process.exit(1);
    }
};

seedResources();
