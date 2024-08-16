// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../utils/auth');

// Route to send a message
router.post('/send', auth, messageController.sendMessage);

// Route to get message history between two users
router.get('/history/:user1/:user2', auth, messageController.getMessageHistory);

module.exports = router;