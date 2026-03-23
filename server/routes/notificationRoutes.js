import express from 'express';
import { getMyNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getMyNotifications);
router.route('/read').put(protect, markNotificationsAsRead);

export default router;