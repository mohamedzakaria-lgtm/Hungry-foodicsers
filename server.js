const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

// Initialize Passport
const passport = require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/offices', require('./routes/offices'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/order-groups', require('./routes/orderGroups'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hungry Foodicsers API is running' });
});

// Start server first (so Railway knows it's running)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// MongoDB connection (non-blocking - server starts even if DB fails initially)
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hungry-foodicsers', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Initialize scheduled order groups
    const { initializeScheduledGroups } = require('./services/orderGroupScheduler');
    await initializeScheduledGroups();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server is running but database connection failed');
    console.error('⚠️  Check MONGODB_URI environment variable');
    // Don't exit - let server run so we can see the error
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
