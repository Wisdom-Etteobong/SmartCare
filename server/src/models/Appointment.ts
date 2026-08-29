import mongoose, { Schema, Document, Types } from 'mongoose';
import { AppointmentStatus, AppointmentType } from '../../../package/src/types/appointment';

export interface IAppointmentDocument extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  reason: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  doctorNotes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  cancellationReason?: string;
  transferredFrom?: Types.ObjectId;
  transferReason?: string;
  transferredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must belong to a patient'],
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Appointment must have a designated doctor'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide an appointment date (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Please provide an appointment time'],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for the appointment'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['In-Person Consultation', 'Follow-up', 'Routine Checkup', 'Emergency Review'],
      default: 'In-Person Consultation',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Doctor notes cannot exceed 2000 characters'],
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters'],
    },
    prescription: {
      type: String,
      trim: true,
      maxlength: [2000, 'Prescription cannot exceed 2000 characters'],
    },
    followUpDate: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    transferredFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    transferReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Transfer reason cannot exceed 1000 characters'],
    },
    transferredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for double booking prevention queries and patient lookup
AppointmentSchema.index({ doctor: 1, date: 1, time: 1 });
AppointmentSchema.index({ patient: 1, status: 1, date: 1 });

export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
