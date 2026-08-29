import { IUser } from './user';
import { IDoctor } from './doctor';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type AppointmentType = 'In-Person Consultation' | 'Follow-up' | 'Routine Checkup' | 'Emergency Review';

export interface IAppointment {
  _id: string;
  patient: string | IUser;
  doctor: string | IDoctor;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  reason: string;
  type?: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  doctorNotes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  cancellationReason?: string;
  transferredFrom?: string | IDoctor;
  transferReason?: string;
  transferredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransferAppointmentDTO {
  targetDoctorId: string;
  transferReason: string;
  handoffNotes?: string;
}

export interface CreateAppointmentDTO {
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  reason: string;
  type?: AppointmentType;
  notes?: string;
}

export interface RescheduleAppointmentDTO {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:30 AM"
  reason?: string;
  notes?: string;
}

export interface AppointmentStats {
  total: number;
  upcoming: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  nextAppointment?: IAppointment | null;
}
