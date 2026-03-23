import express from 'express';
import {
  applyToBeProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getProvidersForService,
  getProviderPublicProfile,
  getProviderAvailability
} from '../controllers/providerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/apply').post(protect, applyToBeProvider);

router.route('/profile/me')
  .get(protect, getMyProviderProfile)
  .put(protect, updateMyProviderProfile);

router.route('/service/:serviceId').get(getProvidersForService);
router.route('/:providerId/availability').get(getProviderAvailability);
router.route('/:id').get(getProviderPublicProfile);

export default router;