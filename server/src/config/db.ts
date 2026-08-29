import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './env';
import { initialDoctors, initialPatients, initialAdminUsers } from '../data/initialData';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';

let isConnected = false;
let isMemoryMode = true;

// In-memory collection storage for environments without active mongod daemon
export interface MemoryStore {
  users: any[];
  doctors: any[];
  appointments: any[];
  notifications: any[];
}

export const memoryStore: MemoryStore = {
  users: [],
  doctors: [],
  appointments: [],
  notifications: [],
};

const defaultDoctorPasswordHash = bcrypt.hashSync('Doctor2026!', 10);

export function seedMemoryStore() {
  // 1. Preload initial doctors
  memoryStore.doctors = initialDoctors.map((doc, idx) => ({
    ...doc,
    _id: `doc_${idx + 1}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // 2. Preload demo patients
  const patientUsers = initialPatients.map((p, idx) => ({
    ...p,
    _id: `user_${idx + 1}`,
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // 3. Preload admin users
  const adminUsers = initialAdminUsers.map((a, idx) => ({
    ...a,
    _id: `admin_${idx + 1}`,
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // 4. Preload doctor user accounts linked to doctor profiles
  const doctorUsers = memoryStore.doctors.map((doc, idx) => ({
    _id: `doc_user_${idx + 1}`,
    name: doc.name,
    email: doc.email.toLowerCase(),
    password: defaultDoctorPasswordHash,
    role: 'doctor' as const,
    doctorId: doc._id,
    phone: doc.phone,
    gender: 'prefer-not-to-say',
    department: doc.department,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Link doctor model `userId` back to doctor user
  memoryStore.doctors.forEach((doc, idx) => {
    doc.userId = `doc_user_${idx + 1}`;
  });

  memoryStore.users = [...patientUsers, ...adminUsers, ...doctorUsers];

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
  const in3DaysStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 5. Add rich initial appointments assigned to doctors
  memoryStore.appointments = [
    {
      _id: 'apt_1',
      patient: 'user_1', // Demo Patient
      doctor: 'doc_1',  // Dr. Sarah Johnson (Cardiologist)
      date: todayStr,
      time: '10:00 AM',
      reason: 'Routine cardiovascular checkup and blood pressure review',
      type: 'In-Person Consultation',
      status: 'Confirmed',
      notes: 'Patient reports occasional mild palpitations when exercising.',
      doctorNotes: 'Assessed BP: 124/82. Regular sinus rhythm. Advised continued moderate aerobic exercise.',
      diagnosis: 'Mild Sinus Arrhythmia - Benign',
      prescription: 'CoQ10 100mg once daily with breakfast. Electrolyte hydration.',
      followUpDate: in3DaysStr,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_2',
      patient: 'user_2', // John Doe
      doctor: 'doc_1',  // Dr. Sarah Johnson
      date: todayStr,
      time: '11:30 AM',
      reason: 'Chest tightness evaluation and resting ECG',
      type: 'In-Person Consultation',
      status: 'Confirmed',
      notes: 'Patient brought previous laboratory records from 2025.',
      doctorNotes: '',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_3',
      patient: 'user_3', // Emily Davis
      doctor: 'doc_1',  // Dr. Sarah Johnson
      date: tomorrowStr,
      time: '02:00 PM',
      reason: 'Follow-up on Holter monitor results',
      type: 'Follow-up',
      status: 'Pending',
      notes: 'Please review 24hr Holter telemetry report.',
      doctorNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_4',
      patient: 'user_1', // Demo Patient
      doctor: 'doc_2',  // Dr. Michael Williams (GP)
      date: todayStr,
      time: '09:00 AM',
      reason: 'Annual general wellness checkup and blood test panel',
      type: 'Routine Checkup',
      status: 'Completed',
      notes: 'Fasted for 10 hours prior to visit.',
      doctorNotes: 'General physical examination normal. CBC and Metabolic Panel drawn. Vital signs within healthy ranges.',
      diagnosis: 'Routine Health Maintenance',
      prescription: 'Multivitamin daily, Vitamin D3 2000 IU daily.',
      followUpDate: in3DaysStr,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_5',
      patient: 'user_2', // John Doe
      doctor: 'doc_2',  // Dr. Michael Williams
      date: tomorrowStr,
      time: '10:30 AM',
      reason: 'Seasonal allergy flare-up and persistent cough',
      type: 'In-Person Consultation',
      status: 'Confirmed',
      notes: 'Symptoms worse in the mornings.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_6',
      patient: 'user_3', // Emily Davis
      doctor: 'doc_3',  // Dr. Emily Brown (Paediatrician)
      date: todayStr,
      time: '01:30 PM',
      reason: 'Child developmental milestone assessment & immunization update',
      type: 'Routine Checkup',
      status: 'Confirmed',
      notes: 'Growth chart records brought along.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt_7',
      patient: 'user_1', // Demo Patient
      doctor: 'doc_4',  // Dr. Daniel Smith (Dermatologist)
      date: yesterdayStr,
      time: '11:00 AM',
      reason: 'Skin rash inspection on forearm',
      type: 'In-Person Consultation',
      status: 'Completed',
      notes: 'Rash appeared after gardening 4 days ago.',
      doctorNotes: 'Contact dermatitis observed. Advised cold compresses and avoidance of irritants.',
      diagnosis: 'Contact Dermatitis',
      prescription: 'Hydrocortisone 1% cream apply twice daily for 7 days.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  // 6. Preload initial notifications
  memoryStore.notifications = [
    {
      _id: 'notif_1',
      userId: 'doc_user_1', // Dr. Sarah Johnson
      recipientRole: 'doctor',
      title: 'New Appointment Booked',
      message: 'Demo Patient booked a Cardiology Consultation for today at 10:00 AM.',
      type: 'appointment_booked',
      relatedId: 'apt_1',
      actionUrl: '/doctor/appointments',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      _id: 'notif_2',
      userId: 'doc_user_1', // Dr. Sarah Johnson
      recipientRole: 'doctor',
      title: 'Upcoming Patient Visit',
      message: 'John Doe is scheduled for a Chest tightness evaluation at 11:30 AM.',
      type: 'appointment_reminder',
      relatedId: 'apt_2',
      actionUrl: '/doctor/appointments',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      _id: 'notif_3',
      userId: 'user_1', // Demo Patient
      recipientRole: 'patient',
      title: 'Appointment Reminder: Today at 10:00 AM',
      message: 'Your Cardiology consultation with Dr. Sarah Johnson is scheduled for today at 10:00 AM.',
      type: 'appointment_reminder',
      relatedId: 'apt_1',
      actionUrl: '/appointments/apt_1',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      _id: 'notif_4',
      userId: 'admin_1', // Admin
      recipientRole: 'admin',
      title: 'Hospital Daily Briefing',
      message: 'System loaded 7 scheduled appointments across 4 active hospital departments.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];

  console.log(`Resilient store initialized with ${memoryStore.doctors.length} doctors, ${memoryStore.users.length} accounts, and ${memoryStore.appointments.length} initial appointments.`);
}

// Seed immediately on file import
seedMemoryStore();

export function isUsingMemoryStore(): boolean {
  return !isConnected || isMemoryMode;
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    console.log(`Connecting to MongoDB at: ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    isConnected = true;
    isMemoryMode = false;
    console.log('MongoDB connected successfully.');

    // Auto-seed if doctors collection is empty
    await autoSeedIfNeeded();
  } catch (error: any) {
    console.warn(`MongoDB direct connection not available (${error.message}).`);
    console.log('Using in-memory database store.');
    isMemoryMode = true;
  }
}

export async function autoSeedIfNeeded(): Promise<void> {
  if (!isConnected) return;
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log('Seeding initial doctors into MongoDB...');
      const savedDocs = await Doctor.insertMany(initialDoctors);
      console.log('Initial doctors seeded.');

      // Seed doctor users linked to doctors
      for (const doc of savedDocs) {
        const existingDocUser = await User.findOne({ email: doc.email.toLowerCase() });
        if (!existingDocUser) {
          const docUser = new User({
            name: doc.name,
            email: doc.email.toLowerCase(),
            password: defaultDoctorPasswordHash,
            role: 'doctor',
            doctorId: doc._id,
            phone: doc.phone,
          });
          await docUser.save();
          doc.userId = docUser._id;
          await doc.save();
        }
      }
    }

    // Seed admin user
    for (const a of initialAdminUsers) {
      const existingAdmin = await User.findOne({ email: a.email.toLowerCase() });
      if (!existingAdmin) {
        const adminUser = new User(a);
        await adminUser.save();
        console.log(`Admin account seeded: ${a.email}`);
      }
    }

    for (const p of initialPatients) {
      const existing = await User.findOne({ email: p.email.toLowerCase() });
      if (!existing) {
        const user = new User(p);
        await user.save();
        console.log(`Demo patient account seeded: ${p.email}`);
      }
    }
  } catch (err: any) {
    console.error('Error during auto-seed:', err.message);
  }
}
