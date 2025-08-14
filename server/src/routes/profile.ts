import express from 'express';
import {
  updateTeacherProfile,
  getTeacherProfile,
  updateStudentProfile,
  getStudentProfile
} from '../controllers/profile-controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

router.get('/teacher', authMiddleware, requireRole('teacher'), getTeacherProfile);
router.put('/teacher', authMiddleware, requireRole('teacher'), updateTeacherProfile);

router.get('/student', authMiddleware, requireRole('student'), getStudentProfile);
router.put('/student', authMiddleware, requireRole('student'), updateStudentProfile);

export default router;
