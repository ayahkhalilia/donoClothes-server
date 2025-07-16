const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ClothesRequest = require('../models/clothesRequest');
const DonationRequest = require('../models/donationRequest');

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




// Add this middleware
function workerOnlyMiddleware(req, res, next) {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Access denied: workers only' });
  }
  next();
}

// Add this controller
async function getAllUsersForWorkers(req, res) {
  try {
    const users = await User.find({}, '-password -photo.data').lean();
    res.json(users);
  } catch (err) {
    console.error('Worker access error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getClothesRequests(req, res) {
try {
    const requests = await ClothesRequest.find().populate('recipient', '-password -photo.data');
    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching clothes requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


async function getClothesRequestUserPhoto(req, res) {
try {
    const user = await User.findById(req.params.id);
    if (!user || !user.photo || !user.photo.data) {
      return res.sendStatus(404);
    }

    res.set('Content-Type', user.photo.contentType);
    res.send(user.photo.data);
  } catch (err) {
    console.error('Error getting user photo:', err);
    res.sendStatus(500);
  }
}











//////////////this is just adding it for now but i need to fix it to be only for the people who can request clothes
async function createClothesRequest(req, res) {
  try {
    const {
      gender,
      age,
      type,
      size,
      color,
      classification,
      note
    } = req.body;

    if (!gender || !age || !type || !size || !color || !classification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const request = await ClothesRequest.create({
      recipient: req.user.id,
      gender,
      age,
      type,
      size,
      color,
      classification,
      note,
      photo: req.file
        ? { data: req.file.buffer, contentType: req.file.mimetype }
        : undefined,
    });

    res.status(201).json({ message: 'Request submitted', request });
  } catch (err) {
    console.error('createClothesRequest:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}




////donation request functions
async function getAllDonationRequests(req, res) {
  try {
    const requests = await DonationRequest.find()
      .populate("donator", "username")
      .lean();

    const formatted = requests.map((r) => ({
      _id: r._id,
      donatorName: r.donator?.username || "Unknown",
      gender: r.gender,
      age: r.age,
      type: r.type,
      size: r.size,
      color: r.color,
      classification: r.classification,
      note: r.note,
      photoCount: r.photos?.length || 0,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to fetch donation requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


async function createDonationRequest(req, res) {
  try {
    const {
      gender,
      age,
      type,
      size,
      color,
      classification,
      note
    } = req.body;

    if (!gender || !age || !type || !size || !color || !classification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const photos = req.files?.map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    })) || [];

    const request = await DonationRequest.create({
      donator: req.user.id,
      gender,
      age,
      type,
      size,
      color,
      classification,
      note,
      photos,
    });

    res.status(201).json({ message: 'Donation request submitted', request });
  } catch (err) {
    console.error('createDonationRequest:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDonationRequestPhoto(req, res) {
  const { id, index } = req.params;
  try {
    const request = await DonationRequest.findById(id);
    const photo = request?.photos?.[index];

    if (!photo) return res.sendStatus(404);

    res.set('Content-Type', photo.contentType);
    res.send(photo.data);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}




module.exports = {
  authMiddleware,
  workerOnlyMiddleware,
  register,
  login,
  getUser,
  getUserPhoto,
  getAllUsersForWorkers,
  getClothesRequests,
  getClothesRequestUserPhoto,
  createClothesRequest,
  createDonationRequest,
  getDonationRequestPhoto,
  getAllDonationRequests,
};
