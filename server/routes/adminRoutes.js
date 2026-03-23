import express from 'express';
import {
  getAllUsers,
  getDashboardStats,
  toggleUserBlockStatus
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, isAdmin, getDashboardStats);
router.route('/users').get(protect, isAdmin, getAllUsers);
router.route('/users/:id/toggle-block').put(protect, isAdmin, toggleUserBlockStatus);

export default router;