// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./utils/db');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:3000', 'http://192.168.11.100:3000', 'http://127.0.0.1:3000'];

const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});


// Config .env
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: allowedOrigins,
}));
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', async (message) => {
        console.log('Message received:', message);
        try {
            // Ensure the message includes all required fields
            if (!message.sender || !message.recipient || !message.text) {
                throw new Error('Invalid message data');
            }
            await Message.create(message); // Save message to database
            io.emit('message', message); // Broadcast message to all connected clients
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
