const express = require('express');
const router = express.Router();
const authController = require('../controllers/dbController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('photo'), authController.register);
router.post('/login', authController.login);
router.get('/me', authController.authMiddleware, authController.getUser);
router.get('/me/photo', authController.authMiddleware, authController.getUserPhoto);
router.put('/logout',authController.logout);

router.get('/worker/users', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getAllUsersForWorkers);

router.get('/worker/get-branch',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getBranch);
router.get('/worker/get-branch-photo',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getBranchPhoto);

router.get('/worker/clothes-requests', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getClothesRequests);
router.get('/worker/clothes-requests/:id/photo', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getClothesRequestUserPhoto);
router.get('/worker/clothes-request-details/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getClothesRequestById);
router.get('/worker/user/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getUserById); /////////
router.post('/worker/storage/search-matching',authController.authMiddleware,authController.workerOnlyMiddleware,authController.checkStorage);
router.put('/worker/storage/mark-donated',authController.authMiddleware,authController.workerOnlyMiddleware,authController.selectClothes);

router.get('/worker/donation-request-details/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonationById);
router.put('/worker/donation-request/:id/accept',authController.authMiddleware,authController.workerOnlyMiddleware,authController.acceptDonationRequest);
router.put('/worker/donation-request/:id/reject',authController.authMiddleware,authController.workerOnlyMiddleware,authController.rejectDonationRequest);
router.get('/worker/donation-request/donator/:donatorId/stats',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonatorStats);

router.post('/donation-request',upload.array('photos'),authController.authMiddleware,authController.createDonationRequest);
router.get('/worker/donation-requests/:id/photo/:index',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonationRequestPhoto);
router.get("/worker/donation-requests",authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllDonationRequests);


module.exports = router;