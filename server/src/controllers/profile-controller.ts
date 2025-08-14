import { Request, Response } from 'express';
import User, { IStudentProfile, ITeacherProfile, IUser } from '../models/User';
import { getAuthenticatedUser } from '../utils/authHelpers';

// Extend Request interface locally
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

interface ProfileRequest extends Request {
  body: {
    email?: string;
    studentProfile?: IStudentProfile;
    teacherProfile?: ITeacherProfile;
  };
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const user = await User.findById(authenticatedUser._id).select('-password');
    
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
    const authenticatedUser = getAuthenticatedUser(req);
    const { email, studentProfile, teacherProfile } = req.body;
    const updateData: any = { email };
    
    if (authenticatedUser.role === 'student' && studentProfile) {
      updateData.studentProfile = studentProfile;
    } else if (authenticatedUser.role === 'teacher' && teacherProfile) {
      updateData.teacherProfile = teacherProfile;
    }

    const user = await User.findByIdAndUpdate(
      authenticatedUser._id,
      updateData,
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

// Teacher-specific profile controllers
export const getTeacherProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const user = await User.findById(authenticatedUser._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Teacher profile fetch error:', err);
    res.status(500).json({ message: 'Server error fetching teacher profile' });
  }
};

export const updateTeacherProfile = async (req: ProfileRequest, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const { teacherProfile, ...otherFields } = req.body;
    
    const updateData: any = {
      ...otherFields,
      teacherProfile,
      profileComplete: true // Mark profile as complete when teacher updates
    };

    const user = await User.findByIdAndUpdate(
      authenticatedUser._id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Teacher profile update error:', err);
    res.status(500).json({ message: 'Server error updating teacher profile' });
  }
};

// Student-specific profile controllers
export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const user = await User.findById(authenticatedUser._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Student profile fetch error:', err);
    res.status(500).json({ message: 'Server error fetching student profile' });
  }
};

export const updateStudentProfile = async (req: ProfileRequest, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const { studentProfile, ...otherFields } = req.body;
    
    const updateData: any = {
      ...otherFields,
      studentProfile,
      profileComplete: true // Mark profile as complete when student updates
    };

    const user = await User.findByIdAndUpdate(
      authenticatedUser._id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Student profile update error:', err);
    res.status(500).json({ message: 'Server error updating student profile' });
  }
};
