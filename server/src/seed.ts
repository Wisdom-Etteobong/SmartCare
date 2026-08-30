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

    console.log('Seeding completed successfully! Note: All patients register directly.');
    console.log('\nDefault Seed Credentials:');
    console.log('1. Doctor Account:   sarah.johnson@smartcare.org| Password: Doctor2026!');
    console.log('2. Doctor Account:   michael.williams@smartcare.org | Password: Doctor2026!');
    console.log('3. Admin Account:    admin@smartcare.org        | Password: Admin2026!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();

