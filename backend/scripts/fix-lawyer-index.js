require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('../features/lawyers/lawyer.model');

const fixIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check indexes
        const indexes = await Lawyer.collection.getIndexes();
        console.log('Current Indexes:', indexes);

        if (indexes.user_1) {
            await Lawyer.collection.dropIndex('user_1');
            console.log('Dropped index: user_1');
        } else {
            console.log('Index user_1 not found.');
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndex();
