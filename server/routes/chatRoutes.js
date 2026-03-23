import express from 'express';
import { getMessagesForBooking } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:bookingId').get(protect, getMessagesForBooking);

export default router;