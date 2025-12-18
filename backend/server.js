const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./shared/config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/lawyers', require('./features/lawyers/lawyer.routes'));
app.use('/api/resources', require('./features/resources/resource.routes'));

// Root
app.get('/', (req, res) => {
  res.send('AinAdvocate API is running...');
});

app.get('/health', (req, res) => {
  res.send('Backend running');
});

// Error handling middleware
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  // hide stack in production if needed, but useful for dev
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
