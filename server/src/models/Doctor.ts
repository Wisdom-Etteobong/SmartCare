import mongoose, { Schema, Document } from 'mongoose';
import { IDoctorAvailability, DayOfWeek } from '../../../package/src/types/doctor';

export interface IDoctorDocument extends Document {
  name: string;
  email?: string;
  userId?: any;
  phone?: string;
  specialty: string;
  profileImage: string;
  biography: string;
  qualifications: string[];
  yearsOfExperience: number;
  department: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  consultationInformation?: string;
  availability: IDoctorAvailability[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema = new Schema<IDoctorAvailability>(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true, // e.g. "09:00"
    },
    endTime: {
      type: String,
      required: true, // e.g. "17:00"
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    breakStartTime: {
      type: String, // e.g. "13:00"
    },
    breakEndTime: {
      type: String, // e.g. "14:00"
    },
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: {
      type: String,
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Please provide doctor specialty'],
      trim: true,
      default: 'General Medicine',
      index: true,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    },
    biography: {
      type: String,
      default: 'Board-certified medical specialist dedicated to providing comprehensive diagnostic evaluations, evidence-based clinical treatments, and patient-centered healthcare.',
    },
    qualifications: {
      type: [String],
      default: () => ['MD', 'MBBS'],
    },
    yearsOfExperience: {
      type: Number,
      default: 5,
      min: 0,
    },
    department: {
      type: String,
      default: 'General Medicine',
      trim: true,
      index: true,
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 24,
    },
    consultationInformation: {
      type: String,
      default: 'Please arrive 15 minutes before your scheduled appointment time with your ID and any previous medical records.',
    },
    availability: {
      type: [AvailabilitySchema],
      default: () => [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
        { day: 'Friday', startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

DoctorSchema.index({ specialty: 1, name: 1 });
DoctorSchema.index({ department: 1 });

export const Doctor = mongoose.model<IDoctorDocument>('Doctor', DoctorSchema);
