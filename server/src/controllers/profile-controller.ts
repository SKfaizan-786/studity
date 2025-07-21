import { Request, Response } from 'express';
import User, { IStudentProfile, ITeacherProfile } from '../models/User';

interface ProfileRequest extends Request {
  body: {
    email?: string;
    studentProfile?: IStudentProfile;
    teacherProfile?: ITeacherProfile;
  };
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateProfile = async (req: ProfileRequest, res: Response) => {
  try {
    const { email, studentProfile, teacherProfile } = req.body;
    const updateData: any = { email };
    
    if (req.user.role === 'student' && studentProfile) {
      updateData.studentProfile = studentProfile;
    } else if (req.user.role === 'teacher' && teacherProfile) {
      updateData.teacherProfile = teacherProfile;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
