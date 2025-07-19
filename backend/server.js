const express = require('express');
const cors = require('cors');
const creatorRoutes = require('./routes/creatorRoutes');
const connectDB = require('./db/config');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/creators', creatorRoutes);

app.use('/api/admin', adminRoutes);

// Connect to MongoDB
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});