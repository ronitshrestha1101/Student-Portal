import express from 'express';
import { loginUser, getUserProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

export default router;
