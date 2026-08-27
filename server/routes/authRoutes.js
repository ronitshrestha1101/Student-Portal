import express from 'express';
import { loginUser, registerUser, getUserProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

export default router;
