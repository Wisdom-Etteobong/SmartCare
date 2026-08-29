import { Doctor, IDoctorDocument } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { isUsingMemoryStore, memoryStore } from '../config/db';
import {
  IDoctor,
  DoctorAvailabilityResponse,
  DoctorSlot,
  DayOfWeek,
} from '../../../package/src/types/doctor';
import {
  getDayOfWeekFromDateString,
  formatTime12H,
  parseTime24H,
} from '../../../package/src/constants/appointment';

export class DoctorService {
  static async getDoctors(filter: {
    search?: string;
    specialty?: string;
    day?: string;
    department?: string;
  }): Promise<IDoctor[]> {
    const { search, specialty, day, department } = filter;

    if (isUsingMemoryStore()) {
      let results = [...memoryStore.doctors];

      if (search) {
        const query = search.toLowerCase();
        results = results.filter(
          doc =>
            doc.name.toLowerCase().includes(query) ||
            doc.specialty.toLowerCase().includes(query) ||
            doc.department.toLowerCase().includes(query) ||
            doc.biography.toLowerCase().includes(query)
        );
      }

      if (specialty && specialty !== 'All') {
        results = results.filter(
          doc => doc.specialty.toLowerCase() === specialty.toLowerCase()
        );
      }

      if (department && department !== 'All') {
        results = results.filter(
          doc => doc.department.toLowerCase() === department.toLowerCase()
        );
      }

      if (day && day !== 'All') {
        results = results.filter(doc =>
          doc.availability.some((a: any) => a.day.toLowerCase() === day.toLowerCase())
        );
      }

      return results;
    }

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { biography: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: new RegExp(`^${specialty}$`, 'i') };
    }

    if (department && department !== 'All') {
      query.department = { $regex: new RegExp(`^${department}$`, 'i') };
    }

    if (day && day !== 'All') {
      query['availability.day'] = { $regex: new RegExp(`^${day}$`, 'i') };
    }

    const doctors = await Doctor.find(query).sort({ rating: -1, yearsOfExperience: -1 });
    return doctors.map(doc => doc.toObject() as unknown as IDoctor);
  }

  static async getDoctorById(id: string): Promise<IDoctor> {
    if (isUsingMemoryStore()) {
      const doctor = memoryStore.doctors.find(d => d._id === id);
      if (!doctor) {
        throw { statusCode: 404, message: 'Doctor not found' };
      }
      return doctor;
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw { statusCode: 404, message: 'Doctor not found' };
    }
    return doctor.toObject() as unknown as IDoctor;
  }

  static async getDoctorAvailability(
    doctorId: string,
    dateStr: string
  ): Promise<DoctorAvailabilityResponse> {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw { statusCode: 400, message: 'Please provide a valid date formatted as YYYY-MM-DD' };
    }

    const targetDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      throw { statusCode: 400, message: 'Cannot check availability for dates in the past' };
    }

    const doctor = await this.getDoctorById(doctorId);
    const dayOfWeek = getDayOfWeekFromDateString(dateStr);
    const schedule = doctor.availability.find(
      a => a.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    const baseResponse: DoctorAvailabilityResponse = {
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        department: doctor.department,
        profileImage: doctor.profileImage,
      },
      date: dateStr,
      dayOfWeek,
      isWorkingDay: !!schedule,
      slots: [],
    };

    if (!schedule) {
      return baseResponse;
    }

    // Retrieve active booked appointments for this doctor on this date
    let bookedTimes: string[] = [];

    if (isUsingMemoryStore()) {
      bookedTimes = memoryStore.appointments
        .filter(
          apt =>
            apt.doctor.toString() === doctorId &&
            apt.date === dateStr &&
            apt.status !== 'Cancelled'
        )
        .map(apt => apt.time.trim().toUpperCase());
    } else {
      const activeAppointments = await Appointment.find({
        doctor: doctorId,
        date: dateStr,
        status: { $ne: 'Cancelled' },
      }).select('time');
      bookedTimes = activeAppointments.map(apt => apt.time.trim().toUpperCase());
    }

    // Generate slots
    const start = parseTime24H(schedule.startTime);
    const end = parseTime24H(schedule.endTime);
    const slotDuration = schedule.slotDurationMinutes || 30;

    let breakStart = schedule.breakStartTime ? parseTime24H(schedule.breakStartTime) : null;
    let breakEnd = schedule.breakEndTime ? parseTime24H(schedule.breakEndTime) : null;

    const startMinutes = start.hours * 60 + start.minutes;
    const endMinutes = end.hours * 60 + end.minutes;
    const breakStartMin = breakStart ? breakStart.hours * 60 + breakStart.minutes : -1;
    const breakEndMin = breakEnd ? breakEnd.hours * 60 + breakEnd.minutes : -1;

    const slots: DoctorSlot[] = [];
    const now = new Date();
    const isToday = targetDate.toDateString() === now.toDateString();
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

    for (let cur = startMinutes; cur + slotDuration <= endMinutes; cur += slotDuration) {
      // Check if slot falls in break time
      if (breakStartMin >= 0 && breakEndMin >= 0) {
        if (cur >= breakStartMin && cur < breakEndMin) {
          continue; // during doctor break
        }
      }

      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const time12 = formatTime12H(h, m);
      const time24 = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;

      const isAlreadyBooked = bookedTimes.includes(time12.toUpperCase());
      const isPastSlot = isToday && cur <= currentMinutesNow + 15; // 15 min buffer

      let isAvailable = true;
      let reasonUnavailable: string | undefined;

      if (isAlreadyBooked) {
        isAvailable = false;
        reasonUnavailable = 'Booked';
      } else if (isPastSlot) {
        isAvailable = false;
        reasonUnavailable = 'Past time';
      }

      slots.push({
        time: time12,
        time24,
        isAvailable,
        reasonUnavailable,
      });
    }

    baseResponse.slots = slots;
    return baseResponse;
  }

  static async createDoctor(doctorData: any, credentials?: { email: string; password?: string }): Promise<{ doctor: IDoctor; userAccount?: any }> {
    const rawDoctor = doctorData?.doctor || doctorData || {};
    const email = (credentials?.email || rawDoctor.email || '').toLowerCase().trim();
    if (!email) {
      throw { statusCode: 400, message: 'Doctor email address is required for access credentials' };
    }

    const name = (rawDoctor.name || '').trim();
    if (!name) {
      throw { statusCode: 400, message: 'Doctor full name is required' };
    }

    // Qualifications parser
    let qualifications: string[] = ['MD', 'MBBS'];
    if (Array.isArray(rawDoctor.qualifications)) {
      qualifications = rawDoctor.qualifications.map((q: any) => String(q).trim()).filter(Boolean);
      if (qualifications.length === 0) qualifications = ['MD', 'MBBS'];
    } else if (typeof rawDoctor.qualifications === 'string' && rawDoctor.qualifications.trim()) {
      qualifications = rawDoctor.qualifications.split(',').map((q: string) => q.trim()).filter(Boolean);
      if (qualifications.length === 0) qualifications = ['MD', 'MBBS'];
    }

    // Availability fallback
    const defaultAvailability = [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
      { day: 'Friday', startTime: '09:00', endTime: '16:00', slotDurationMinutes: 30 },
    ];
    const availability = Array.isArray(rawDoctor.availability) && rawDoctor.availability.length > 0
      ? rawDoctor.availability
      : defaultAvailability;

    const specialty = rawDoctor.specialty?.trim() || 'General Medicine';
    const department = rawDoctor.department?.trim() || 'General Medicine';
    const yearsOfExperience = Number(rawDoctor.yearsOfExperience) || 5;
    const consultationFee = Number(rawDoctor.consultationFee) || 60;
    const phone = rawDoctor.phone?.trim() || '+1 (555) 012-3456';
    const profileImage = rawDoctor.profileImage?.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600';
    const biography = rawDoctor.biography?.trim() || 'Board-certified medical specialist dedicated to providing comprehensive diagnostic evaluations, evidence-based clinical treatments, and patient-centered healthcare.';
    const roomNumber = rawDoctor.roomNumber?.trim() || 'Suite 201';

    const doctorId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: any = {
      ...rawDoctor,
      _id: doctorId,
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      email,
      specialty,
      department,
      qualifications,
      yearsOfExperience,
      consultationFee,
      phone,
      profileImage,
      biography,
      roomNumber,
      availability,
      isActive: rawDoctor.isActive !== false,
      rating: rawDoctor.rating || 4.9,
      reviewCount: rawDoctor.reviewCount || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const bcrypt = require('bcryptjs');
    const password = credentials?.password || rawDoctor.password || 'Doctor2026!';
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isUsingMemoryStore()) {
      // Check existing user in memory
      const existingUserIdx = memoryStore.users.findIndex(u => u.email.toLowerCase() === email);
      const docUserId = existingUserIdx !== -1 ? memoryStore.users[existingUserIdx]._id : `doc_user_${Date.now()}`;

      const docUser = {
        _id: docUserId,
        name: newDoc.name,
        email: email,
        password: hashedPassword,
        role: 'doctor' as const,
        doctorId: doctorId,
        phone: newDoc.phone,
        department: newDoc.department,
        gender: 'prefer-not-to-say',
        mustChangePassword: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingUserIdx !== -1) {
        memoryStore.users[existingUserIdx] = docUser;
      } else {
        memoryStore.users.push(docUser);
      }

      newDoc.userId = docUserId;
      memoryStore.doctors.push(newDoc);

      return { doctor: newDoc, userAccount: { email, role: 'doctor', doctorId } };
    }

    const doc = new Doctor({
      ...newDoc,
    });
    await doc.save();

    // Create / Update MongoDB User account
    const User = require('../models/User').User;
    let docUser = await User.findOne({ email });
    if (docUser) {
      docUser.name = doc.name;
      docUser.role = 'doctor';
      docUser.doctorId = doc._id;
      docUser.phone = doc.phone;
      docUser.department = doc.department;
      docUser.password = hashedPassword;
      docUser.mustChangePassword = false;
      await docUser.save();
    } else {
      docUser = new User({
        name: doc.name,
        email: email,
        password: hashedPassword,
        role: 'doctor',
        doctorId: doc._id,
        phone: doc.phone,
        department: doc.department,
        gender: 'prefer-not-to-say',
        mustChangePassword: false,
        isActive: true,
      });
      await docUser.save();
    }

    doc.userId = docUser._id;
    await doc.save();

    return { doctor: doc.toObject() as unknown as IDoctor, userAccount: { email, role: 'doctor', doctorId: String(doc._id) } };
  }

  static async updateDoctor(doctorId: string, updates: any): Promise<IDoctor> {
    if (isUsingMemoryStore()) {
      const idx = memoryStore.doctors.findIndex(d => d._id === doctorId);
      if (idx === -1) throw { statusCode: 404, message: 'Doctor not found' };

      const current = memoryStore.doctors[idx];
      const updated = {
        ...current,
        ...updates,
        _id: current._id,
        updatedAt: new Date().toISOString(),
      };
      memoryStore.doctors[idx] = updated;

      // Sync name / department to user account if exists
      const userIdx = memoryStore.users.findIndex(u => u.doctorId === doctorId);
      if (userIdx !== -1) {
        if (updates.name) memoryStore.users[userIdx].name = updates.name;
        if (updates.department) memoryStore.users[userIdx].department = updates.department;
      }

      return updated;
    }

    const updated = await Doctor.findByIdAndUpdate(doctorId, updates, { new: true });
    if (!updated) throw { statusCode: 404, message: 'Doctor not found' };
    return updated.toObject() as unknown as IDoctor;
  }
}

