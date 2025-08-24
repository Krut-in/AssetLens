import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import type { User } from '@shared/schema';

// Extend Express Request to include user and session
declare global {
  namespace Express {
    interface User extends User {}
    interface Request {
      session: session.Session & Partial<session.SessionData> & {
        tempUserId?: string;
      };
    }
  }
}

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Middleware to get current user (optional - doesn't require auth)
export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  // User will be available in req.user if authenticated, undefined if not
  next();
};

// Get user ID from request (authenticated user or generate temporary ID)
export const getUserId = (req: Request): string => {
  if (req.isAuthenticated() && req.user) {
    return req.user.id;
  }
  
  // For non-authenticated users, use session-based temporary ID
  if (!req.session.tempUserId) {
    req.session.tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return req.session.tempUserId;
};

// Check if user is using temporary session
export const isTemporaryUser = (req: Request): boolean => {
  return !req.isAuthenticated();
};
