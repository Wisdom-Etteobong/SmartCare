import mongoose from 'mongoose';
import { config } from './config/env';
import { initialDoctors, initialPatients, initialAdminUsers, doctorPasswordHash } from './data/initialData';
import { Doctor } from './models/Doctor';
import { User } from './models/User';
import { Appointment } from './models/Appointment';

async function seedDatabase() {
  console.log('--- SmartCare Development Database Seeder ---');
  console.log(`Connecting to MongoDB at ${config.mongoUri}...`);

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing doctors, demo patients, admin users, and appointments...');
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // Insert Doctors
    console.log(`Inserting ${initialDoctors.length} doctors with availability schedules...`);
    const createdDoctors = await Doctor.insertMany(initialDoctors);
    console.log(`Successfully seeded ${createdDoctors.length} doctors.`);

    // Insert Patients
    console.log(`Inserting ${initialPatients.length} demo patient accounts...`);
    const createdPatients = [];
    for (const patient of initialPatients) {
      const user = new User(patient);
      const saved = await user.save();
      createdPatients.push(saved);
      console.log(` Created patient: ${patient.email}`);
    }

    // Insert Admin Users
    console.log(`Inserting ${initialAdminUsers.length} system administrator accounts...`);
    const createdAdmins = [];
    for (const admin of initialAdminUsers) {
      const user = new User(admin);
      const saved = await user.save();
      createdAdmins.push(saved);
      console.log(` Created admin: ${admin.email}`);
    }

    // Insert Doctor User Accounts linked to Doctors
    console.log(`Inserting ${createdDoctors.length} doctor portal user accounts (password: Doctor2026!)...`);
    for (let i = 0; i < createdDoctors.length; i++) {
      const doc = createdDoctors[i];
      const docUser = new User({
        name: doc.name,
        email: doc.email?.toLowerCase() || `doctor_${i + 1}@smartcare.org`,
        password: doctorPasswordHash,
        role: 'doctor',
        doctorId: doc._id,
        phone: doc.phone,
        department: doc.department,
        gender: 'prefer-not-to-say',
        mustChangePassword: false,
        isActive: true,
      });
      const savedDocUser = await docUser.save();
      await Doctor.findByIdAndUpdate(doc._id, { userId: savedDocUser._id });
      console.log(` Created doctor account: ${docUser.email}`);
    }

    // Insert sample appointments
    if (createdPatients.length > 0 && createdDoctors.length > 0) {
      const today = new Date();
      const futureDate1 = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];
      const futureDate2 = new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0];

      await Appointment.create([
        {
          patient: createdPatients[0]._id,
          doctor: createdDoctors[0]._id,
          date: futureDate1,
          time: '10:00 AM',
          reason: 'Routine cardiovascular checkup and blood pressure review',
          type: 'In-Person Consultation',
          status: 'Confirmed',
          notes: 'Patient requested morning consultation.',
        },
        {
          patient: createdPatients[0]._id,
          doctor: createdDoctors[1]._id,
          date: futureDate2,
          time: '02:30 PM',
          reason: 'Annual health checkup and routine blood tests',
          type: 'Routine Checkup',
          status: 'Pending',
          notes: 'Please bring prior medical history records.',
        },
      ]);
      console.log('Sample appointments created.');
    }

    console.log('Seeding completed successfully!');
    console.log('\nDefault Seed Credentials:');
    console.log('1. Patient Account:  patient@smartcare.org      | Password: Password123!');
    console.log('2. Patient Account:  john.doe@example.com       | Password: password123');
    console.log('3. Doctor Account:   sarah.johnson@smartcare.org| Password: Doctor2026!');
    console.log('4. Doctor Account:   michael.williams@smartcare.org | Password: Doctor2026!');
    console.log('5. Admin Account:    admin@smartcare.org        | Password: Admin2026!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();

