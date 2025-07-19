const express = require('express');
const router = express.Router();
const authController = require('../controllers/dbController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('photo'), authController.register);
router.post('/login', authController.login);
router.get('/me', authController.authMiddleware, authController.getUser);
router.get('/me/photo', authController.authMiddleware, authController.getUserPhoto);

router.get('/worker/users', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getAllUsersForWorkers);

router.get('/worker/clothes-requests', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getClothesRequests);
router.get('/worker/clothes-requests/:id/photo', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getClothesRequestUserPhoto);
router.get('/worker/clothes-request-details/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getClothesRequestById);
router.get('/worker/user/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getUserById); /////////



router.post('/donation-request',upload.array('photos'),authController.authMiddleware,authController.createDonationRequest);
router.get('/worker/donation-requests/:id/photo/:index',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonationRequestPhoto);
router.get("/worker/donation-requests",authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllDonationRequests);


module.exports = router;