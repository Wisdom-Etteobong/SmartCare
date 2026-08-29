import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully. Welcome to SmartCare!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      if (result.token) {
        res.cookie('token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.json({
        success: true,
        message: result.requireOtp ? '2FA verification code required' : 'Logged in successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.verifyOtp(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: '2FA verification successful. Welcome back!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeFirstPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user._id || req.user.id;
      const { newPassword, currentPassword } = req.body;
      const user = await AuthService.changeFirstPassword(userId, newPassword, currentPassword);

      res.json({
        success: true,
        message: 'Password changed successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user._id || req.user.id);
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.updateProfile(req.user._id || req.user.id, req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search } = req.query;
      const users = await AuthService.listUsers(role as string, search as string);
      res.json({
        success: true,
        count: users.length,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await AuthService.updateUserByAdmin(id, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await AuthService.deleteUserByAdmin(id);
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, newPassword } = req.body;
      await AuthService.resetPassword(userId, newPassword);
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Public forgot password request
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      res.json({
        success: true,
        message: `Password reset verification code dispatched to ${result.maskedEmail}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Public reset password execution
  static async resetPasswordWithOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPasswordWithOtp(req.body);
      res.json({
        success: true,
        message: result.message,
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }
}
