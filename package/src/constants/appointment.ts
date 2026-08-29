import { DayOfWeek, DoctorSpecialty } from '../types/doctor';
import { AppointmentStatus, AppointmentType } from '../types/appointment';

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export const APPOINTMENT_TYPES: AppointmentType[] = [
  'In-Person Consultation',
  'Follow-up',
  'Routine Checkup',
  'Emergency Review',
];

export const SPECIALTIES: DoctorSpecialty[] = [
  'General Practitioner',
  'Cardiologist',
  'Paediatrician',
  'Dermatologist',
  'Dentist',
  'Neurologist',
  'Orthopaedic Specialist',
  'Ophthalmologist',
  'Psychiatrist',
  'Gynaecologist',
];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEPARTMENTS = [
  'Outpatient Clinic',
  'Cardiology Department',
  'Paediatrics & Child Health',
  'Dermatology & Skin Center',
  'Dental Surgery',
  'Neurology & Brain Sciences',
  'Orthopaedics & Joint Clinic',
  'Ophthalmology & Eye Care',
  'Psychiatry & Mental Wellness',
  'Obstetrics & Gynaecology',
];

// Time slot helper utilities
export function formatTime12H(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours < 10 ? '0' : ''}${displayHours}:${displayMinutes} ${period}`;
}

export function formatTime24H(hours: number, minutes: number): string {
  const displayHours = hours < 10 ? `0${hours}` : `${hours}`;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes}`;
}

export function parseTime24H(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.trim().split(':');
  return {
    hours: parseInt(parts[0], 10) || 0,
    minutes: parseInt(parts[1], 10) || 0,
  };
}

export function getDayOfWeekFromDateString(dateStr: string): DayOfWeek {
  const date = new Date(dateStr + 'T00:00:00');
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ...
  const mapping: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return mapping[dayIndex];
}
