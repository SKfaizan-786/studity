import { Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Utility to extract error message
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Internal server error';

// -------------------- Teacher Profile --------------------

export const updateTeacherProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Received data:', req.body);
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      teacherProfile: {
        phone: req.body.phone,
        location: req.body.location,
        qualifications: req.body.qualifications,
        experienceYears: req.body.experienceYears,
        currentOccupation: req.body.currentOccupation,
        subjects: req.body.subjectsTaught || req.body.subjects, // Handle both field names
        boards: req.body.boardsTaught || req.body.boards, // Handle both field names
        classes: req.body.classesTaught || req.body.classes, // Handle both field names
        teachingMode: req.body.teachingMode,
        preferredSchedule: req.body.preferredSchedule,
        bio: req.body.bio,
        teachingApproach: req.body.teachingApproach,
        achievements: req.body.achievements,
        hourlyRate: req.body.hourlyRate,
        photoUrl: req.body.photoUrl
      },
      profileComplete: true
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        profileComplete: updatedUser.profileComplete,
        teacherProfile: updatedUser.teacherProfile
      }
    });

  } catch (error: unknown) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getTeacherProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires') as IUser | null;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher profile required.' });
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      teacherProfile: user.teacherProfile
    });

  } catch (error: unknown) {
    console.error('Teacher profile fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching teacher profile',
      error: getErrorMessage(error)
    });
  }
};

// -------------------- Student Profile --------------------

export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== STUDENT PROFILE UPDATE DEBUG ===');
    console.log('Received student profile data:', JSON.stringify(req.body, null, 2));
    
    if (!req.user?._id) {
      console.log('❌ User not authenticated');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log('✅ User authenticated:', req.user._id);

    // Extract data - handle both nested and flat structures
    const { firstName, lastName, studentProfile } = req.body;

    // If data comes in nested format (like current student form)
    if (studentProfile) {
      const updateData = {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        studentProfile: {
          phone: studentProfile.phone,
          location: studentProfile.location,
          grade: studentProfile.grade,
          subjects: studentProfile.subjects || [],
          learningGoals: studentProfile.learningGoals || [],
          bio: studentProfile.bio,
          photoUrl: studentProfile.photoUrl
        },
        profileComplete: true
      };

      console.log('Update data (nested format):', JSON.stringify(updateData, null, 2));

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        console.log('❌ User not found in database');
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log('✅ User updated successfully');
      console.log('Updated user profileComplete:', updatedUser.profileComplete);

      const responseData = {
        success: true,
        message: 'Student profile updated successfully',
        user: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          profileComplete: updatedUser.profileComplete,
          studentProfile: updatedUser.studentProfile
        }
      };

      console.log('Response data:', JSON.stringify(responseData, null, 2));
      console.log('=== END STUDENT PROFILE UPDATE DEBUG ===');

      return res.status(200).json(responseData);
    }

    // If data comes in flat format (like teacher form) - for future compatibility
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      studentProfile: {
        phone: req.body.phone,
        location: req.body.location,
        grade: req.body.grade,
        subjects: req.body.subjects || [],
        learningGoals: req.body.learningGoals || [],
        bio: req.body.bio,
        photoUrl: req.body.photoUrl
      },
      profileComplete: true
    };

    console.log('Update data (flat format):', JSON.stringify(updateData, null, 2));

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('❌ User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('✅ User updated successfully');
    console.log('Updated user profileComplete:', updatedUser.profileComplete);

    const responseData = {
      success: true,
      message: 'Student profile updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        profileComplete: updatedUser.profileComplete,
        studentProfile: updatedUser.studentProfile
      }
    };

    console.log('Response data:', JSON.stringify(responseData, null, 2));
    console.log('=== END STUDENT PROFILE UPDATE DEBUG ===');

    res.status(200).json(responseData);

  } catch (error: unknown) {
    console.error('❌ Student profile update error:', error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

export const getStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET STUDENT PROFILE DEBUG ===');
    
    if (!req.user?._id) {
      console.log('❌ User not authenticated');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('✅ User authenticated:', req.user._id);

    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires') as IUser | null;

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      console.log('❌ User is not a student, role:', user.role);
      return res.status(403).json({ message: 'Access denied. Student profile required.' });
    }

    console.log('Student profile data from database:');
    console.log('- profileComplete:', user.profileComplete);
    console.log('- hasStudentProfile:', !!user.studentProfile);
    console.log('- studentProfile:', JSON.stringify(user.studentProfile, null, 2));

    const responseData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete, // Return the actual value from database
      studentProfile: user.studentProfile
    };

    console.log('Response data:', JSON.stringify(responseData, null, 2));
    console.log('=== END GET STUDENT PROFILE DEBUG ===');

    res.status(200).json(responseData);

  } catch (error: unknown) {
    console.error('❌ Student profile fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching student profile',
      error: getErrorMessage(error)
    });
  }
};

// -------------------- Teacher Listing --------------------

export const updateTeacherListingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update listing status' });
    }

    // Check if teacher profile is complete
    if (!user.teacherProfile || !user.teacherProfile.subjects || user.teacherProfile.subjects.length === 0) {
      return res.status(400).json({ message: 'Please complete your teacher profile first' });
    }

    // Toggle listing status or set to true
    const newListingStatus = req.body.isListed !== undefined ? req.body.isListed : true;
    
    // Update the listing status
    user.teacherProfile.isListed = newListingStatus;
    
    if (newListingStatus) {
      user.teacherProfile.listedAt = new Date();
    }

    await user.save();

    res.json({
      message: newListingStatus ? 'Successfully listed as teacher' : 'Removed from teacher listings',
      isListed: user.teacherProfile.isListed,
      listedAt: user.teacherProfile.listedAt
    });

  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({ message: 'Failed to update listing status' });
  }
};

// Add a test function to debug teacher listing
export const getListedTeachers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔍 Getting listed teachers...');
    
    // Find all teachers with detailed logging
    const allTeachers = await User.find({ role: 'teacher' });
    console.log(`📊 Total teachers found: ${allTeachers.length}`);
    
    // Check each teacher's listing status
    allTeachers.forEach(teacher => {
      console.log(`👨‍🏫 Teacher: ${teacher.firstName} ${teacher.lastName}`);
      console.log(`📧 Email: ${teacher.email}`);
      console.log(`✅ Has teacher profile: ${!!teacher.teacherProfile}`);
      console.log(`📝 isListed: ${teacher.teacherProfile?.isListed}`);
      console.log(`📅 listedAt: ${teacher.teacherProfile?.listedAt}`);
      console.log('---');
    });
    
    // Find listed teachers
    const listedTeachers = await User.find({
      role: 'teacher',
      'teacherProfile.isListed': true
    }).select('firstName lastName email teacherProfile');
    
    console.log(`🎯 Listed teachers found: ${listedTeachers.length}`);
    
    res.json({
      totalTeachers: allTeachers.length,
      listedTeachers: listedTeachers.length,
      teachers: listedTeachers
    });
    
  } catch (error) {
    console.error('❌ Error getting listed teachers:', error);
    res.status(500).json({ message: 'Failed to get listed teachers' });
  }
};