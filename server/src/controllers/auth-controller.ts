import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Fixed casing

// REGISTER (Already working)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password, role });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// LOGIN (with improved logging)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("❌ Email not found");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn("❌ Password mismatch for", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("✅ Login success for", email);

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profileComplete: false,
      token
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
