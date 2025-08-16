import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { getListedTeachers } from '../controllers/profile-controller';

const router = express.Router();

// Add debug route (temporarily)
router.get('/debug', authMiddleware, getListedTeachers);

// Get list of all available teachers
router.get('/list', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('🔍 API: Getting teacher list...');
    
    const teachers = await User.find({
      role: 'teacher',
      'teacherProfile.isListed': true
    }).select('firstName lastName email teacherProfile');

    console.log(`📊 Found ${teachers.length} listed teachers`);
    
    // Log each found teacher
    teachers.forEach(teacher => {
      console.log(`✅ Listed teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
    });

    res.json(teachers);
  } catch (error) {
    console.error('❌ Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get specific teacher details
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: 'teacher'
    }).select('firstName lastName email teacherProfile');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Failed to fetch teacher details' });
  }
});

export default router;