// controllers/messageController.js
const Message = require('../models/Message');

// Send a new message and save it to the database
exports.sendMessage = async (req, res) => {
    const { text, sender, recipient } = req.body;

    try {
        const newMessage = new Message({ text, sender, recipient });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server Error');
    }
};

// Get messages between two users
exports.getMessageHistory = async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
        console.log(messages)
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server Error');
    }
};