const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const multer  = require('multer');

const User    = require('../models/User');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage() });

/*POST /auth/register*/
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { username, password, role, phonenumber, age, kids, email } = req.body;

    if (!username || !password || !role || !phonenumber || !age || !kids || !email || !req.file) {
      return res.status(400).json({ error: 'All fields (including photo) are required' });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      role,
      phonenumber,
      age:  Number(age),
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
});

/* POST /auth/login */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*user profile photo*/

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /auth/me-user data (no photo buffer)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id, '-password -photo.data').lean();
  res.json(user);
});

// GET /auth/me/photo(raw image bytes)
router.get('/me/photo', auth, async (req, res) => {
  const user = await User.findById(req.user.id, 'photo').lean();
  if (!user || !user.photo) return res.sendStatus(404);

  res.set('Content-Type', user.photo.contentType);
  res.send(user.photo.data);
});




module.exports = router;
