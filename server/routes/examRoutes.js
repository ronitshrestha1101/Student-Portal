import express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamResultsRoster,
  saveBulkResults,
  publishExamResults,
  getMyResults,
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-results', protect, authorize('student'), getMyResults);

router
  .route('/')
  .get(protect, getExams)
  .post(protect, authorize('teacher', 'admin'), createExam);

router
  .route('/:id')
  .get(protect, getExamById)
  .put(protect, authorize('teacher', 'admin'), updateExam)
  .delete(protect, authorize('teacher', 'admin'), deleteExam);

router
  .route('/:examId/results')
  .get(protect, authorize('teacher', 'admin'), getExamResultsRoster)
  .post(protect, authorize('teacher', 'admin'), saveBulkResults);

router.put('/:id/publish', protect, authorize('teacher', 'admin'), publishExamResults);

export default router;
