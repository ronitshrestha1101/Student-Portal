import express from 'express';
import {
  getCourseAttendance,
  saveBulkAttendance,
  getMyAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-attendance', protect, authorize('student'), getMyAttendance);
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseAttendance);
router.post('/', protect, authorize('teacher', 'admin'), saveBulkAttendance);

export default router;
