const express = require('express');
const router = express.Router();
const authController = require('../controllers/dbController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('photo'), authController.register);
router.post('/login', authController.login);
router.get('/me', authController.authMiddleware, authController.getUser);
router.get('/me/photo', authController.authMiddleware, authController.getUserPhoto);

module.exports = router;