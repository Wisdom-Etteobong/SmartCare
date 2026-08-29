import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  static async getMyNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user._id || req.user.id).toString();
      const role = req.user.role;
      const unreadOnly = req.query.unread === 'true';

      const notifications = await NotificationService.getUserNotifications(userId, role, unreadOnly);
      const stats = await NotificationService.getStats(userId, role);

      res.json({
        success: true,
        count: notifications.length,
        data: {
          notifications,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user._id || req.user.id).toString();
      const role = req.user.role;
      const { id } = req.params;

      const updated = await NotificationService.markAsRead(id, userId, role);
      res.json({
        success: true,
        message: updated ? 'Notification marked as read' : 'Notification not found or access denied',
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user._id || req.user.id).toString();
      const role = req.user.role;

      const count = await NotificationService.markAllAsRead(userId, role);
      res.json({
        success: true,
        message: `${count} notifications marked as read`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user._id || req.user.id).toString();
      const role = req.user.role;
      const { id } = req.params;

      const deleted = await NotificationService.deleteNotification(id, userId, role);
      res.json({
        success: true,
        message: deleted ? 'Notification removed' : 'Notification not found or access denied',
      });
    } catch (error) {
      next(error);
    }
  }
}
