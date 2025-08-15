// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Ensure this path is correct
import mongoose from 'mongoose'; // Keep this import

// Define AuthenticatedRequest interface
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// !!! REMOVE THE 'declare global' BLOCK FROM HERE !!!
// It should NOT be in this file. It belongs in a .d.ts file.
/*
declare global {
  namespace Express {
    interface Request {
      user?: any; // THIS IS THE CONFLICTING PART
    }
  }
}
*/

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // ... (rest of your authMiddleware code, including the new mongoose.Types.ObjectId(decoded._id) line)
  try {
    let token = req.header('Authorization');

    if (!token) {
      console.log('No Authorization header provided.');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Clean the token: remove 'Bearer ' prefix and any surrounding quotes
    token = token.replace(/^"|"$/g, '').replace('Bearer ', '');

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { _id: string; iat: number; exp: number };
    console.log('Decoded token:', decoded);

    // Explicitly convert the decoded._id string to a Mongoose ObjectId
    const userId = new mongoose.Types.ObjectId(decoded._id);
    console.log('Searching for user with ID (explicit ObjectId):', userId);

    const user = await User.findById(userId).select('-password'); // Use the explicitly converted ObjectId

    console.log('Result of User.findById in authMiddleware:', user ? 'User found' : 'User NOT found');

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'User not found or token invalid' });
    }

    req.user = user; // This 'user' property will now correctly pick up the type from index.d.ts
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    res.status(500).json({ message: 'Server Error during authentication' });
  }
};