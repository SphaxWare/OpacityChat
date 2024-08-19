// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./utils/db');
const cors = require('cors');
const Message = require('./models/Message');
const User = require('./models/User');

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
const userSocketMap = new Map(); // link socketid with the right user
io.on('connection', (socket) => {
    console.log('A user connected');
    console.log(socket.id)

    socket.on('userOnline', async (userId) => {
        try {
            const user = await User.findByIdAndUpdate(userId, { isOnline: true }, { new: true }).exec();
            if (user) {
                io.emit('updateUserStatus', { userId, isOnline: true });
                console.log('User', user.username, 'is NOW ONLINE !!!!!');
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('joinRoom', (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ID ${userId} is associated with socket ID ${socket.id}`);
        socket.join(userId);
    });

    socket.on('sendMessage', async (message) => {
        console.log('Message received:', message);
        try {
            if (!message.sender || !message.recipient || !message.text) {
                throw new Error('Invalid message data');
            }

            message.timestamp = new Date();

            await Message.create(message); // Save message to the database

            const recipientSocketId = userSocketMap.get(message.recipient);
            const senderSocketId = userSocketMap.get(message.sender);

            // Emit the message to both sender and recipient
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('message', message);
                console.log(`Message sent to socket ID: ${recipientSocketId} with user ID: ${message.recipient}`);
                console.log(userSocketMap)
            } else {
                console.log(`User ${message.recipient} is not connected`);
            }
            // Emit the message back to the sender
            if (senderSocketId) {
                io.to(senderSocketId).emit('message', message);
                console.log(`Message sent back to sender socket ID: ${senderSocketId} with user ID: ${message.sender}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('userOffline', async (userId) => {
        try {
            const user = await User.findByIdAndUpdate(userId, { isOnline: false }, { new: true }).exec();
            if (user) {
                io.emit('updateUserStatus', { userId: userId, isOnline: false });
                console.log('User', user.username, 'IS NOW OFFLINE !!!!!!!!!!', new Date().toLocaleTimeString());
                console.log(user.isOnline)
            }
        } catch (err) {
            console.error('Error marking user as offline:', err);
        }
    });
    
    socket.on('disconnect', () => {
        userSocketMap.forEach(async (value, key) => {
            if (value === socket.id) {
                userSocketMap.delete(key);
                console.log("disconnect ----------------\n value: ", value, "\nkey: ", key, "\nsocket id: ", socket.id)
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
