import express from 'express';
import {
  updateTeacherProfile,
  getTeacherProfile,
  updateStudentProfile,
  getStudentProfile,
  updateTeacherListingStatus
} from '../controllers/profile-controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Teacher routes
router.get('/teacher', authMiddleware, requireRole('teacher'), getTeacherProfile);
router.put('/teacher', authMiddleware, requireRole('teacher'), updateTeacherProfile);
router.patch('/teacher/listing', authMiddleware, updateTeacherListingStatus);

// Student routes
router.get('/student', authMiddleware, requireRole('student'), getStudentProfile);
router.put('/student', authMiddleware, requireRole('student'), updateStudentProfile);

// Generic profile route (gets profile based on user role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.role === 'teacher') {
      return getTeacherProfile(req, res);
    } else if (user.role === 'student') {
      return getStudentProfile(req, res);
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Generic profile update route (updates profile based on user role)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.role === 'teacher') {
      return updateTeacherProfile(req, res);
    } else if (user.role === 'student') {
      return updateStudentProfile(req, res);
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;