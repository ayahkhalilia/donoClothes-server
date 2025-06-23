const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const router = express.Router();

// Store photo in memory (for saving in DB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { username, password, role, phonenumber, age, kids, email } = req.body;

    // Validate required fields
    if (!username || !password || !role || !phonenumber || !age || !kids || !email || !req.file) {
      return res.status(400).json({ error: 'All fields including photo are required' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role,
      phonenumber,
      age: Number(age),
      kids: Number(kids),
      email,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
