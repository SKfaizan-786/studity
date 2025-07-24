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
        subjects: req.body.subjects,
        boards: req.body.boards,
        classes: req.body.classes,
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
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { grade, subjects, parentEmail, firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    const studentProfile = { grade, subjects, parentEmail };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        studentProfile,
        profileComplete: true
      },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Student profile updated successfully',
      user: updatedUser
    });

  } catch (error: unknown) {
    console.error('Student profile update error:', error);
    res.status(500).json({
      message: 'Server error updating student profile',
      error: getErrorMessage(error)
    });
  }
};

export const getStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires') as IUser | null;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student profile required.' });
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      studentProfile: user.studentProfile
    });

  } catch (error: unknown) {
    console.error('Student profile fetch error:', error);
    res.status(500).json({
      message: 'Server error fetching student profile',
      error: getErrorMessage(error)
    });
  }
};