import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUserDocument } from '../models/User';
import { Doctor } from '../models/Doctor';
import { isUsingMemoryStore, memoryStore } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument | any;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string; doctorId?: string };

    if (isUsingMemoryStore()) {
      const user = memoryStore.users.find(
        u => u._id === decoded.id || (u.email && decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User account no longer exists.',
        });
        return;
      }
      if (user.role === 'doctor' && !user.doctorId) {
        const doc = memoryStore.doctors.find(
          d => d.userId === user._id || (d.email && user.email && d.email.toLowerCase() === user.email.toLowerCase())
        );
        if (doc) user.doctorId = doc._id;
      }
      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
      return;
    }

    if (user.role === 'doctor' && !user.doctorId) {
      try {
        const doc = await Doctor.findOne({
          $or: [{ userId: user._id }, { email: user.email?.toLowerCase() }],
        });
        if (doc) user.doctorId = doc._id;
      } catch {
        // ignore
      }
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const userRole = req.user.role || 'patient';
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]. Current role: ${userRole}`,
      });
      return;
    }

    next();
  };
}

export const requireDoctor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in as a doctor.',
    });
    return;
  }

  const role = req.user.role;
  if (role !== 'doctor' && role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access restricted. Doctor Portal access is restricted to verified healthcare providers.',
    });
    return;
  }

  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Developer / System Administrator privileges required.',
    });
    return;
  }

  next();
};

