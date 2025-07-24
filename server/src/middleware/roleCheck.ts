import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Access denied. Requires ${requiredRole} role` 
      });
    }

    next();
  };
};