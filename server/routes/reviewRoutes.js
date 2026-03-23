import express from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReview);
router.route('/provider/:providerId').get(getProviderReviews);

export default router;