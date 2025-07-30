const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ClothesRequest = require('../models/clothesRequest');
const DonateNeeds = require('../models/Need');
const DonationRequest = require('../models/donationRequest');
const Storage = require('../models/storage');
const Branch= require('../models/branch');
const Alert=require('../models/alert');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    const { username, password, role, phonenumber, address, age, kids, email } = req.body;

    if (!username || !password || !role || !phonenumber || !address || !age || !kids || !email || !req.file) {
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
      address,
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
    const requests = await ClothesRequest.find({status:'pending'}).populate('recipient', '-password -photo.data');
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
    const requests = await DonationRequest.find({ status: 'pending' })
      .populate("donator", "-password -photo.data")
      .lean();
      res.status(200).json(requests);
  } catch (err) {
    console.error("Failed to fetch donation requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllDonationReqUserPhoto(req,res) {
  try{
    const user=await User.findById(req.params.id);
    if(!user || !user.photo || !user.photo.data){
      return res.sendStatus(404);
    }
    res.set('Content-Type', user.photo.contentType);
    res.send(user.photo.data);
  } catch (err){
    console.error("Error fetching user photo:", err);
    res.sendstatus(500);
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
      note,
    } = req.body;

    if (!gender || !age || !type || !size || !color || !classification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
const rawDates = req.body.availablePickupDates || [];
const availablePickupDates = Array.isArray(rawDates)
  ? rawDates.map(date => new Date(date))
  : [new Date(rawDates)];
console.log(req.body);

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
      availablePickupDates
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


async function getClothesRequestById(req, res){
  try {
    const request = await ClothesRequest.findById(req.params.id).populate('recipient');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    console.error("Error fetching clothes request by ID:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


async function getUserById(req, res){
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
};



async function getDonationById(req, res){
  try {
    const donationRequest = await DonationRequest.findById(req.params.id).populate("donator","_id username");
    if (!donationRequest) {
      return res.status(404).json({ message: "Donation request not found" });
    }
    res.json(donationRequest);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



async function acceptDonationRequest(req, res){
  const { id } = req.params;
  const { selectedPickupDate } = req.body;


  try {
    const request = await DonationRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending')
      return res.status(400).json({ error: 'Request already processed' });

  if (!selectedPickupDate) {
    return res.status(400).json({ error: 'Pickup date is required' });
  }
  
    request.status = 'accepted';
    request.selectedPickupDate = new Date(selectedPickupDate);
    await request.save();

    // Save item to storage
    const storedItem = new Storage({
      donationRequestId: request._id,
      donator: request.donator,
      gender: request.gender,
      age: request.age,
      type: request.type,
      size: request.size,
      color: request.color,
      classification: request.classification,
      note: request.note,
      photos: request.photos,
      status: 'available',
    });

    await storedItem.save();
    await Alert.create({
      userId: request.donator,
      requestId: request._id,
      message: `Your donation request has been accepted. Pickup will be on ${new Date(selectedPickupDate).toLocaleDateString()}.`,
    });
    res.status(200).json({ message: 'Request accepted and saved to storage' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function rejectDonationRequest(req, res){
  const { id } = req.params;

  try {
    const request = await DonationRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending')
      return res.status(400).json({ error: 'Request already processed' });

    request.status = 'rejected';
    await request.save();
    await Alert.create({
     userId: request.donator,
     requestId: request._id,
     message: 'Your donation request has been rejected.',
    });
    res.status(200).json({ message: 'Request rejected successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

///this func for the donation req details page under the donator info to display how many donations and the pending donations
async function getDonatorStats(req, res){
  const { donatorId } = req.params;

  try {
    const [accepted, pending] = await Promise.all([
      DonationRequest.countDocuments({ donator: donatorId, status: 'accepted' }),
      DonationRequest.find({ donator: donatorId, status: 'pending' }).lean()
    ]);

    res.json({
      acceptedCount: accepted,
      pendingRequests: pending.map(r => ({
        _id: r._id,
        type: r.type,
        gender: r.gender,
        color: r.color
      }))
    });
  } catch (err) {
    console.error("Error fetching donator stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

///check storage function for the clothes request details page in the front
async function  checkStorage(req, res){
  try {
    const { gender, age, type, size, color, classification } = req.body;

    const items = await Storage.find({
      gender,
      age,
      type,
      size,
      color,
      classification,
      status: 'available'
    });

    res.json(items);
  } catch (err) {
    console.error('Error searching storage:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/////this is a function for selecting items in the clothes request details page
async function selectClothes(req, res) {
  const { itemIds, clothesRequestId } = req.body;

  try {
    await Storage.updateMany(
      { _id: { $in: itemIds }, status: 'available' },
      { $set: { status: 'donated' } }
    );

    if (clothesRequestId) {
      await ClothesRequest.findByIdAndUpdate(clothesRequestId, {
        status: "fulfilled"
      });
    }

    res.json({ message: 'Items updated successfully' });
  } catch (err) {
    console.error('Error updating storage items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//fetch branch info functions
async function getBranch (req, res){
  try {
    const branch = await Branch.findOne(); 
    res.json(branch);
  } catch (err) {
    console.error("Error fetching branch:", err);
    res.status(500).json({ error: "Server error" });
  }
};


async function getBranchPhoto(req, res) {
  try {
    const branch = await Branch.findOne();

    if (!branch || !branch.photo || !branch.photo.data) {
      return res.sendStatus(404); 
    }

    res.set("Content-Type", branch.photo.contentType);
    res.send(branch.photo.data);
  } catch (err) {
    console.error("Error fetching branch photo:", err);
    res.sendStatus(500); 
  }
}


///////logout function
async function logout(req, res){
  try {
    res.status(200).json({ message: "Logout successful on client" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed. Please try again." });
  }
};


//function to get all items in storage
async function getAllStorageItems(req, res){
  try {
    const storageItems = await Storage.find();

    const formattedItems = storageItems.map(item => ({
      _id: item._id,
      donator: item.donator?.username || 'Unknown',
      gender: item.gender,
      age: item.age,
      type: item.type,
      size: item.size,
      color: item.color,
      classification: item.classification,
      note: item.note,
      status: item.status,
      photos: item.photos.map(photo => {
        if (photo.data && photo.contentType) {
          const base64 = photo.data.toString('base64');
          return `data:${photo.contentType};base64,${base64}`;
        }
        return null;
      }).filter(Boolean)
    }));

    res.json(formattedItems);
  } catch (err) {
    console.error('Error fetching storage items:', err);
    res.status(500).json({ error: 'Failed to fetch storage items' });
  }
};



//////update storage item
async function updateStorageItem (req, res){
  try {
    const updatedItem = await Storage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

///////delete storage item
async function deleteStorageItem(req, res){
  try {
    await Storage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


async function addItemToStorage(req, res){
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

    const newItem = new Storage({
      donationRequestId: null, 
      donator: req.user._id,
      gender,
      age,
      type,
      size,
      color,
      classification,
      note,
      photos: req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }))
    });

    await newItem.save();
    res.status(201).json({ message: "Item added", item: newItem });
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Server error" });
  }
};


///////for alert for the donator pages
async function alertBell(req,res){
  const userId = req.params.id;
  try {
    const alerts = await Alert.find({ user: userId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("Failed to get alerts:", err);
    res.status(500).json({ error: "Failed to get alerts" });
  }
};

async function alertMarkRead(req,res){
  const userId = req.params.id;
  try {
    await Alert.updateMany({ user: userId, read: false }, { $set: { read: true } });
    res.sendStatus(200);
  } catch (err) {
    console.error("Failed to mark alerts as read:", err);
    res.status(500).json({ error: "Failed to mark alerts as read" });
  }
};


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
  getAllDonationReqUserPhoto,
  getClothesRequestById,
  getUserById,
  getDonationById,
  acceptDonationRequest,
  rejectDonationRequest,
  getDonatorStats,
  checkStorage,
  selectClothes,
  getBranch,
  getBranchPhoto,
  logout,
  getAllStorageItems,
  updateStorageItem,
  deleteStorageItem,
  addItemToStorage,
  alertBell,
  alertMarkRead,
};
