const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./db/config');

const app = express();

app.use(cors({ origin: ['http://localhost:5173','https://talent-matcher-ai-rust.vercel.app/'], credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

connectDB();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const searcherRoutes = require('./routes/searcherRoutes'); // New

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/searcher', searcherRoutes); // New

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));