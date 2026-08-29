export type NotificationType =
  | 'appointment_booked'
  | 'appointment_transferred'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'login_alert'
  | 'system';

export interface INotification {
  _id: string;
  userId: string;
  recipientRole?: 'patient' | 'doctor' | 'admin' | 'all';
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string; // appointmentId or doctorId
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
}
