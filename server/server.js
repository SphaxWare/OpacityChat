// server.js
const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors');

const app = express();

// Config .env
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Serve static files from the "public" directory
app.use(express.static('public'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));