const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const buffer = req.file.buffer
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    if (req.file) {
      console.log("req.file:", req.file);
      console.log("req.file.buffer:", req.file.buffer);
      user = new User({
        username,
        email,
        password,
        profilePic: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });
    } else {
      console.log("req.file is undefined");
      user = new User({ username, email, password });
    }

    await user.save();

    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error');
    console.log(req.file.buffer)
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// get all the users in database

exports.getAllUsers = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUserId = decoded.id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
  const { username, bio } = req.body;
  
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  try {
    // Extract the user ID from the token
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the user's information
    if (username) user.username = username;
    if (bio) user.bio = bio;

    // Check if a new profile picture was uploaded
    if (req.file) {
      console.log("Updating profile picture...");
      user.profilePic = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }
    //console.log("Edited: ",user)
    // Save the updated user information
    await user.save();

    res.json({ msg: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
