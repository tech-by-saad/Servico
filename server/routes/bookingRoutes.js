import express from 'express';
import {
  createBooking,
  getMyBookings,
  updateBooking,
  deleteBooking,
  getProviderBookings,
  updateBookingStatus,
  confirmMutualCancellation
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);
  
router.route('/mybookings')
  .get(protect, getMyBookings);
  
router.route('/provider')
  .get(protect, getProviderBookings);

router.route('/:id')
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

router.route('/:id/confirm-cancellation')
  .put(protect, confirmMutualCancellation);

export default router;