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

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // 2. Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ 
        message: 'JWT secret not configured' 
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // 3. Find user in database
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      res.status(401).json({ 
        message: 'Token is valid but user not found' 
      });
      return;
    }

    // 4. Attach user to request object
    req.user = user;

    // 5. Continue to next middleware/route handler
    next();

  } catch (error) {
    // Handle different JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        message: 'Invalid token' 
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        message: 'Token has expired' 
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication' 
    });
  }
};

/**
 * Optional Auth Middleware - Same as authMiddleware but doesn't block if no token
 * Useful for routes that work for both authenticated and non-authenticated users
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no token, just continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await User.findById(decoded._id).select('-password');
    
    if (user) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Don't block the request if token is invalid in optional auth
    console.log('Optional auth middleware error (non-blocking):', error);
    next();
  }
};
