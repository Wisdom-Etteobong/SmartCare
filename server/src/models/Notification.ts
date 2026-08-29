import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: string;
  recipientRole?: 'patient' | 'doctor' | 'admin' | 'all';
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'all'],
      default: 'patient',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_transferred',
        'appointment_reminder',
        'appointment_cancelled',
        'appointment_completed',
        'login_alert',
        'system',
      ],
      default: 'system',
    },
    relatedId: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
