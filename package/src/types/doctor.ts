export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface IDoctorAvailability {
  day: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes?: number; // default 30
  breakStartTime?: string; // e.g. "13:00"
  breakEndTime?: string;   // e.g. "14:00"
}

export type DoctorSpecialty =
  | 'General Practitioner'
  | 'Cardiologist'
  | 'Paediatrician'
  | 'Dermatologist'
  | 'Dentist'
  | 'Neurologist'
  | 'Orthopaedic Specialist'
  | 'Ophthalmologist'
  | 'Psychiatrist'
  | 'Gynaecologist';

export interface IDoctor {
  _id: string;
  name: string;
  email?: string;
  userId?: string;
  phone?: string;
  specialty: DoctorSpecialty | string;
  profileImage: string;
  biography: string;
  qualifications: string[];
  yearsOfExperience: number;
  department: string;
  consultationFee?: number;
  rating?: number;
  reviewCount?: number;
  consultationInformation?: string;
  availability: IDoctorAvailability[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorSlot {
  time: string;       // e.g. "09:00 AM"
  time24: string;     // e.g. "09:00"
  isAvailable: boolean;
  reasonUnavailable?: string; // e.g. "Already Booked" or "Past Slot"
}

export interface DoctorAvailabilityResponse {
  doctor: {
    _id: string;
    name: string;
    specialty: string;
    department: string;
    profileImage: string;
  };
  date: string;
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  slots: DoctorSlot[];
}
