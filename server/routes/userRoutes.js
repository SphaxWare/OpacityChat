const express = require('express');
const { registerUser, loginUser, getProfile , getAllUsers} = require('../controllers/userController');
const auth = require('../utils/auth');
const router = express.Router();
const multer = require('multer');

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/register', (req, res, next) => {
    upload.single('profilePic')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).send('File upload error');
      }
      next();
    });
  }, registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getProfile);
router.get('/all', auth, getAllUsers)

module.exports = router;