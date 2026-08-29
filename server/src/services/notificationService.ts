import { Notification, INotificationDocument } from '../models/Notification';
import { isUsingMemoryStore, memoryStore } from '../config/db';
import { INotification, NotificationStats, NotificationType } from '../../../package/src/types/notification';

export interface CreateNotificationParams {
  userId: string;
  recipientRole?: 'patient' | 'doctor' | 'admin' | 'all';
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  actionUrl?: string;
}

export class NotificationService {
  static async createNotification(params: CreateNotificationParams): Promise<INotification> {
    const { userId, recipientRole = 'patient', title, message, type, relatedId, actionUrl } = params;

    if (isUsingMemoryStore()) {
      const newNotif: any = {
        _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: userId.toString(),
        recipientRole,
        title: title.trim(),
        message: message.trim(),
        type,
        relatedId: relatedId?.toString(),
        actionUrl,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!memoryStore.notifications) {
        memoryStore.notifications = [];
      }
      memoryStore.notifications.unshift(newNotif);
      return newNotif;
    }

    const doc = new Notification({
      userId: userId.toString(),
      recipientRole,
      title: title.trim(),
      message: message.trim(),
      type,
      relatedId: relatedId?.toString(),
      actionUrl,
      isRead: false,
    });

    await doc.save();
    return doc.toObject() as unknown as INotification;
  }

  static async getUserNotifications(
    userId: string,
    role: string,
    unreadOnly: boolean = false
  ): Promise<INotification[]> {
    if (isUsingMemoryStore()) {
      if (!memoryStore.notifications) {
        memoryStore.notifications = [];
      }

      let list = memoryStore.notifications.filter(n => {
        if (n.userId === userId.toString()) return true;
        if (role === 'admin' && (n.recipientRole === 'admin' || n.recipientRole === 'all')) return true;
        return false;
      });

      if (unreadOnly) {
        list = list.filter(n => !n.isRead);
      }

      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }

    const query: any = {
      $or: [
        { userId: userId.toString() },
        ...(role === 'admin' ? [{ recipientRole: { $in: ['admin', 'all'] } }] : []),
      ],
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    const list = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    return list.map(d => d.toObject() as unknown as INotification);
  }

  static async markAsRead(notificationId: string, userId: string, role: string): Promise<boolean> {
    if (isUsingMemoryStore()) {
      if (!memoryStore.notifications) return false;
      const notif = memoryStore.notifications.find(n => n._id === notificationId);
      if (!notif) return false;

      // Allow if owned by user or if admin
      if (notif.userId === userId.toString() || role === 'admin') {
        notif.isRead = true;
        notif.updatedAt = new Date().toISOString();
        return true;
      }
      return false;
    }

    const notif = await Notification.findById(notificationId);
    if (!notif) return false;

    if (notif.userId === userId.toString() || role === 'admin') {
      notif.isRead = true;
      await notif.save();
      return true;
    }

    return false;
  }

  static async markAllAsRead(userId: string, role: string): Promise<number> {
    if (isUsingMemoryStore()) {
      if (!memoryStore.notifications) return 0;
      let count = 0;
      memoryStore.notifications.forEach(n => {
        if (n.userId === userId.toString() || (role === 'admin' && (n.recipientRole === 'admin' || n.recipientRole === 'all'))) {
          if (!n.isRead) {
            n.isRead = true;
            n.updatedAt = new Date().toISOString();
            count++;
          }
        }
      });
      return count;
    }

    const filter: any = {
      $or: [
        { userId: userId.toString() },
        ...(role === 'admin' ? [{ recipientRole: { $in: ['admin', 'all'] } }] : []),
      ],
      isRead: false,
    };

    const res = await Notification.updateMany(filter, { isRead: true });
    return res.modifiedCount;
  }

  static async deleteNotification(notificationId: string, userId: string, role: string): Promise<boolean> {
    if (isUsingMemoryStore()) {
      if (!memoryStore.notifications) return false;
      const idx = memoryStore.notifications.findIndex(n => n._id === notificationId);
      if (idx === -1) return false;

      const notif = memoryStore.notifications[idx];
      if (notif.userId === userId.toString() || role === 'admin') {
        memoryStore.notifications.splice(idx, 1);
        return true;
      }
      return false;
    }

    const notif = await Notification.findById(notificationId);
    if (!notif) return false;

    if (notif.userId === userId.toString() || role === 'admin') {
      await Notification.findByIdAndDelete(notificationId);
      return true;
    }
    return false;
  }

  static async getStats(userId: string, role: string): Promise<NotificationStats> {
    const all = await this.getUserNotifications(userId, role, false);
    const unread = all.filter(n => !n.isRead).length;
    return {
      totalCount: all.length,
      unreadCount: unread,
    };
  }

  // System broadcast helper
  static async broadcastToAdmins(title: string, message: string, relatedId?: string, type: NotificationType = 'system'): Promise<void> {
    await this.createNotification({
      userId: 'admin_broadcast',
      recipientRole: 'admin',
      title,
      message,
      type,
      relatedId,
    });
  }
}
