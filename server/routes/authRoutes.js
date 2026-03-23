import express from 'express';
import { 
    registerUser, 
    loginUser, 
    googleAuth,
    registerAdmin // 1. Import
} from '../controllers/authController.js';
import { checkIfBlocked } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register-admin', registerAdmin); // 2. Add new route
router.post('/login', checkIfBlocked, loginUser);
router.post('/google-auth', googleAuth);

export default router;