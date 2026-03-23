import express from 'express';
import { updateUserProfile, changeUserPassword, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'; // Import upload middleware

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile); // Apply middleware here

router.route('/change-password').put(protect, changeUserPassword);

export default router;