const express = require('express');
const router = express.Router();
const authController = require('../controllers/dbController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Alert=require('../models/alert');

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
router.get('/worker/storage/:itemId/photo/:index',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getStoragePhoto);

router.get('/worker/get-recipient-request-history/:recipientId',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllClothesRequestsHistory);


router.get('/worker/count-items-in-storage',authController.authMiddleware,authController.workerOnlyMiddleware,authController.countAvailableStorageItems);


router.get('/worker/donation-request-details/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonationById);
router.put('/worker/donation-request/:id/accept',authController.authMiddleware,authController.workerOnlyMiddleware,authController.acceptDonationRequest);
router.put('/worker/donation-request/:id/reject',authController.authMiddleware,authController.workerOnlyMiddleware,authController.rejectDonationRequest);
router.get('/worker/donation-request/donator/:donatorId/stats',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonatorStats);

router.post('/donation-request',upload.array('photos'),authController.authMiddleware,authController.createDonationRequest);
router.get('/worker/donation-requests/:id/photo/:index',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getDonationRequestPhoto);
router.get("/worker/donation-requests",authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllDonationRequests);
router.get('/worker/donation-request/:id/photo', authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllDonationReqUserPhoto);

router.get('/worker/get-all-storage-items',authController.authMiddleware,authController.workerOnlyMiddleware,authController.getAllStorageItems);
router.put('/worker/update-storage-item/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.updateStorageItem);
router.delete('/worker/delete-storage-item/:id',authController.authMiddleware,authController.workerOnlyMiddleware,authController.deleteStorageItem);
router.post('/worker/add-item-to-storage',upload.array('photos'),authController.authMiddleware,authController.workerOnlyMiddleware,authController.addItemToStorage);


router.get('/alert-bell/:userId', authController.authMiddleware, authController.alertBell); 
router.put('/mark-read/:userId', authController.authMiddleware, authController.alertMarkRead); 


router.get('/worker/clothes-requests/search',authController.authMiddleware,authController.workerOnlyMiddleware,authController.searchClothesRequests);
router.get('/worker/donation-requests/search',authController.authMiddleware,authController.workerOnlyMiddleware,authController.searchDonationRequests);

router.get('/logo',authController.authMiddleware,authController.getLogo);
router.get('/worker/storage/shortage', authController.authMiddleware, authController.workerOnlyMiddleware, authController.getRecentStorageShortage);
router.get('/worker/clothes-requests/:id/common',authController.authMiddleware,authController.workerOnlyMiddleware,authController.commonClotheReq);
module.exports = router;