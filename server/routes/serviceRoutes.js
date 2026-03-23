import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getPopularServices // 1. Import new function
} from '../controllers/serviceController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// 2. Add the new route
router.route('/popular').get(getPopularServices);

router.route('/')
  .get(getServices)
  .post(protect, isAdmin, upload.single('image'), createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, isAdmin, upload.single('image'), updateService)
  .delete(protect, isAdmin, deleteService);

export default router;