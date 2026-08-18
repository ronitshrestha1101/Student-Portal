import express from 'express';
import {
  getAnnouncements,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorize('admin'), createAnnouncement);

router.get('/admin', protect, authorize('admin'), getAdminAnnouncements);

router
  .route('/:id')
  .put(protect, authorize('admin'), updateAnnouncement)
  .delete(protect, authorize('admin'), deleteAnnouncement);

export default router;
