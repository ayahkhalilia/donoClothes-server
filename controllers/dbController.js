const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check and decode token
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Register new user
async function register(req, res) {
  try {
    const { username, password, role, phonenumber, age, kids, email } = req.body;

    if (!username || !password || !role || !phonenumber || !age || !kids || !email || !req.file) {
      return res.status(400).json({ error: 'All fields (including photo) are required' });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      phonenumber,
      age: Number(age),
      kids: Number(kids),
      email,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Login
async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user info
async function getUser(req, res) {
  try {
    const user = await User.findById(req.user.id, '-password -photo.data').lean();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user info' });
  }
}

// Get user photo
async function getUserPhoto(req, res) {
  try {
    const user = await User.findById(req.user.id, 'photo');
    if (!user || !user.photo || !user.photo.data) {
      return res.sendStatus(404);
    }

    res.set('Content-Type', user.photo.contentType);
    res.send(user.photo.data);
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.sendStatus(500);
  }
}

module.exports = {
  authMiddleware,
  register,
  login,
  getUser,
  getUserPhoto,
};