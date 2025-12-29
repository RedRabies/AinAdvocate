require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌  MONGO_URI not found in .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅  Connected to MongoDB Atlas successfully!');
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌  Connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
