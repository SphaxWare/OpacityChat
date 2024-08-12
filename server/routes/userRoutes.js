const express = require('express');
const { registerUser, loginUser, getProfile } = require('../controllers/userController');
const auth = require('../utils/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getProfile);

module.exports = router;