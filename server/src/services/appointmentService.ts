import { Appointment, IAppointmentDocument } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { DoctorService } from './doctorService';
import { isUsingMemoryStore, memoryStore } from '../config/db';
import { NotificationService } from './notificationService';
import {
  CreateAppointmentDTO,
  RescheduleAppointmentDTO,
  TransferAppointmentDTO,
  IAppointment,
  AppointmentStats,
} from '../../../package/src/types/appointment';

export class AppointmentService {
  static async createAppointment(
    patientId: string,
    data: CreateAppointmentDTO
  ): Promise<IAppointment> {
    const { doctorId, date, time, reason, type, notes } = data;

    if (!doctorId || !date || !time || !reason) {
      throw { statusCode: 400, message: 'Doctor, date, time, and reason for visit are required' };
    }

    // 1. Verify doctor availability on that date
    const availability = await DoctorService.getDoctorAvailability(doctorId, date);

    if (!availability.isWorkingDay) {
      throw {
        statusCode: 400,
        message: `The doctor is not scheduled to work on ${availability.dayOfWeek}s. Please choose a different date.`,
      };
    }

    // 2. Check requested time slot
    const normalizedTime = time.trim();
    const matchingSlot = availability.slots.find(
      s => s.time.toUpperCase() === normalizedTime.toUpperCase()
    );

    if (!matchingSlot) {
      throw {
        statusCode: 400,
        message: `The selected time (${time}) is not within the doctor's working schedule.`,
      };
    }

    if (!matchingSlot.isAvailable) {
      throw {
        statusCode: 409,
        message: `This appointment slot (${time} on ${date}) is no longer available. Please select another time.`,
      };
    }

    // 3. Double-check double booking prevention
    let createdApt: IAppointment;

    if (isUsingMemoryStore()) {
      const existingConflict = memoryStore.appointments.find(
        apt =>
          (apt.doctor._id || apt.doctor).toString() === doctorId &&
          apt.date === date &&
          apt.time.trim().toUpperCase() === normalizedTime.toUpperCase() &&
          apt.status !== 'Cancelled'
      );

      if (existingConflict) {
        throw {
          statusCode: 409,
          message: `This appointment slot is already booked by another patient. Please select another time.`,
        };
      }

      const newAppointment: any = {
        _id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        patient: patientId,
        doctor: doctorId,
        date,
        time: matchingSlot.time,
        reason: reason.trim(),
        type: type || 'In-Person Consultation',
        status: 'Confirmed',
        notes: notes?.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.appointments.push(newAppointment);

      const docObj = memoryStore.doctors.find(d => d._id === doctorId);
      const patObj = memoryStore.users.find(u => u._id === patientId);

      createdApt = {
        ...newAppointment,
        doctor: docObj || doctorId,
        patient: patObj || patientId,
      };
    } else {
      const existingConflict = await Appointment.findOne({
        doctor: doctorId,
        date,
        time: matchingSlot.time,
        status: { $ne: 'Cancelled' },
      });

      if (existingConflict) {
        throw {
          statusCode: 409,
          message: 'This appointment slot is already booked. Please select another time.',
        };
      }

      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date,
        time: matchingSlot.time,
        reason: reason.trim(),
        type: type || 'In-Person Consultation',
        status: 'Confirmed',
        notes: notes?.trim(),
      });

      await appointment.save();
      const populated = await Appointment.findById(appointment._id)
        .populate('doctor')
        .populate('patient', '-password');

      createdApt = populated!.toObject() as unknown as IAppointment;
    }

    // Auto-dispatch In-App Notifications
    const doctorObj: any = createdApt.doctor;
    const patientObj: any = createdApt.patient;
    const patientName = patientObj?.name || 'A patient';
    const doctorName = doctorObj?.name || 'Doctor';

    // Find Doctor's user account ID to notify doctor
    let doctorUserId = doctorObj?.userId;
    if (!doctorUserId && isUsingMemoryStore()) {
      const docUser = memoryStore.users.find(u => u.doctorId === (doctorObj?._id || doctorId));
      if (docUser) doctorUserId = docUser._id;
    }

    if (doctorUserId) {
      await NotificationService.createNotification({
        userId: doctorUserId,
        recipientRole: 'doctor',
        title: 'New Appointment Booked',
        message: `${patientName} booked a ${createdApt.type || 'Consultation'} on ${date} at ${matchingSlot.time}. Reason: "${reason.trim()}"`,
        type: 'appointment_booked',
        relatedId: createdApt._id,
        actionUrl: '/doctor/appointments',
      });
    }

    // Notify Patient
    await NotificationService.createNotification({
      userId: patientId,
      recipientRole: 'patient',
      title: 'Appointment Confirmed',
      message: `Your booking with ${doctorName} on ${date} at ${matchingSlot.time} has been successfully confirmed.`,
      type: 'appointment_booked',
      relatedId: createdApt._id,
      actionUrl: `/appointments/${createdApt._id}`,
    });

    // Notify Admin
    await NotificationService.broadcastToAdmins(
      'New Hospital Appointment',
      `${patientName} booked with ${doctorName} for ${date} at ${matchingSlot.time}.`,
      createdApt._id,
      'appointment_booked'
    );

    return createdApt;
  }

  static async getPatientAppointments(
    patientId: string,
    statusFilter?: string
  ): Promise<IAppointment[]> {
    if (isUsingMemoryStore()) {
      let list = memoryStore.appointments.filter(
        apt => (apt.patient._id || apt.patient).toString() === patientId.toString()
      );

      if (statusFilter && statusFilter !== 'All') {
        list = list.filter(apt => apt.status.toLowerCase() === statusFilter.toLowerCase());
      }

      list.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

      return list.map(apt => {
        const docObj = memoryStore.doctors.find(d => d._id === (apt.doctor._id || apt.doctor));
        const patObj = memoryStore.users.find(u => u._id === (apt.patient._id || apt.patient));
        const transferredFromObj = apt.transferredFrom ? memoryStore.doctors.find(d => d._id === (apt.transferredFrom._id || apt.transferredFrom)) : undefined;
        return {
          ...apt,
          doctor: docObj || apt.doctor,
          patient: patObj || apt.patient,
          transferredFrom: transferredFromObj || apt.transferredFrom,
        };
      });
    }

    const query: any = { patient: patientId };
    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor')
      .populate('transferredFrom')
      .populate('patient', '-password')
      .sort({ date: -1, createdAt: -1 });

    return appointments.map(apt => apt.toObject() as unknown as IAppointment);
  }

  static async getAppointmentById(
    appointmentId: string,
    requestingUserId: string
  ): Promise<IAppointment> {
    return this.getAppointmentByIdSecure(appointmentId, { id: requestingUserId, role: 'patient' });
  }

  static async getAppointmentByIdSecure(
    appointmentId: string,
    requestingUser: { id: string; role: string; doctorId?: string }
  ): Promise<IAppointment> {
    if (isUsingMemoryStore()) {
      const apt = memoryStore.appointments.find(a => a._id === appointmentId);
      if (!apt) {
        throw { statusCode: 404, message: 'Appointment not found' };
      }

      const patientIdStr = (apt.patient._id || apt.patient).toString();
      const doctorIdStr = (apt.doctor._id || apt.doctor).toString();

      if (requestingUser.role === 'admin') {
        // Full access
      } else if (requestingUser.role === 'doctor') {
        if (requestingUser.doctorId && doctorIdStr !== requestingUser.doctorId.toString()) {
          throw {
            statusCode: 403,
            message: 'Access denied. You can only view appointments assigned to you.',
          };
        }
      } else {
        if (patientIdStr !== requestingUser.id.toString()) {
          throw {
            statusCode: 403,
            message: 'Access denied. You can only view your own appointments.',
          };
        }
      }

      const docObj = memoryStore.doctors.find(d => d._id === (apt.doctor._id || apt.doctor));
      const patObj = memoryStore.users.find(u => u._id === patientIdStr);
      const transferredFromObj = apt.transferredFrom ? memoryStore.doctors.find(d => d._id === (apt.transferredFrom._id || apt.transferredFrom)) : undefined;

      return {
        ...apt,
        doctor: docObj || apt.doctor,
        patient: patObj || apt.patient,
        transferredFrom: transferredFromObj || apt.transferredFrom,
      };
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor')
      .populate('transferredFrom')
      .populate('patient', '-password');

    if (!appointment) {
      throw { statusCode: 404, message: 'Appointment not found' };
    }

    const patientIdStr = (appointment.patient as any)._id
      ? (appointment.patient as any)._id.toString()
      : appointment.patient.toString();

    const doctorIdStr = (appointment.doctor as any)._id
      ? (appointment.doctor as any)._id.toString()
      : appointment.doctor.toString();

    if (requestingUser.role === 'admin') {
      // Allowed
    } else if (requestingUser.role === 'doctor') {
      if (requestingUser.doctorId && doctorIdStr !== requestingUser.doctorId.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only view appointments assigned to you.',
        };
      }
    } else {
      if (patientIdStr !== requestingUser.id.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only view your own appointments.',
        };
      }
    }

    return appointment.toObject() as unknown as IAppointment;
  }

  static async getDoctorAppointments(
    doctorId: string,
    filters?: { status?: string; date?: string; search?: string }
  ): Promise<IAppointment[]> {
    if (!doctorId) {
      throw { statusCode: 400, message: 'Doctor ID is required' };
    }

    if (isUsingMemoryStore()) {
      let list = memoryStore.appointments.filter(
        apt => (apt.doctor._id || apt.doctor).toString() === doctorId.toString()
      );

      if (filters?.status && filters.status !== 'All') {
        list = list.filter(apt => apt.status.toLowerCase() === filters.status!.toLowerCase());
      }

      if (filters?.date) {
        list = list.filter(apt => apt.date === filters.date);
      }

      let populated = list.map(apt => {
        const docObj = memoryStore.doctors.find(d => d._id === (apt.doctor._id || apt.doctor));
        const patId = (apt.patient?._id || apt.patient)?.toString();
        const foundUser = memoryStore.users.find(u => u._id === patId);
        const patObj = foundUser || {
          _id: patId || 'pat_anon',
          name: (apt as any).patientName || (apt.patient as any)?.name || 'Registered Patient',
          email: (apt as any).patientEmail || (apt.patient as any)?.email || 'patient@smartcare.org',
          phone: (apt as any).patientPhone || (apt.patient as any)?.phone || '+1 (555) 019-2834',
          gender: (apt as any).patientGender || (apt.patient as any)?.gender || 'female',
          bloodGroup: (apt as any).patientBloodGroup || (apt.patient as any)?.bloodGroup || 'O+',
        };
        const transferredFromObj = apt.transferredFrom ? memoryStore.doctors.find(d => d._id === (apt.transferredFrom._id || apt.transferredFrom)) : undefined;
        return {
          ...apt,
          doctor: docObj || apt.doctor,
          patient: patObj,
          transferredFrom: transferredFromObj || apt.transferredFrom,
        };
      });

      if (filters?.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        populated = populated.filter(apt => {
          const pat = apt.patient as any;
          const patientName = pat?.name?.toLowerCase() || '';
          const reason = apt.reason?.toLowerCase() || '';
          const diagnosis = apt.diagnosis?.toLowerCase() || '';
          return patientName.includes(query) || reason.includes(query) || diagnosis.includes(query);
        });
      }

      populated.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
      return populated;
    }

    const query: any = { doctor: doctorId };
    if (filters?.status && filters.status !== 'All') {
      query.status = filters.status;
    }
    if (filters?.date) {
      query.date = filters.date;
    }

    let appointments = await Appointment.find(query)
      .populate('doctor')
      .populate('transferredFrom')
      .populate('patient', '-password')
      .sort({ date: -1, createdAt: -1 });

    let result = appointments.map(apt => apt.toObject() as unknown as IAppointment);

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(apt => {
        const pat = apt.patient as any;
        const patientName = pat?.name?.toLowerCase() || '';
        const reason = apt.reason?.toLowerCase() || '';
        const diagnosis = apt.diagnosis?.toLowerCase() || '';
        return patientName.includes(q) || reason.includes(q) || diagnosis.includes(q);
      });
    }

    return result;
  }

  static async updateDoctorAppointment(
    appointmentId: string,
    doctorId: string,
    updates: {
      status?: any;
      doctorNotes?: string;
      diagnosis?: string;
      prescription?: string;
      followUpDate?: string;
      cancellationReason?: string;
    }
  ): Promise<IAppointment> {
    let resultApt: IAppointment;

    if (isUsingMemoryStore()) {
      const idx = memoryStore.appointments.findIndex(a => a._id === appointmentId);
      if (idx === -1) {
        throw { statusCode: 404, message: 'Appointment not found' };
      }

      const apt = memoryStore.appointments[idx];
      const assignedDoctorId = (apt.doctor._id || apt.doctor).toString();

      if (assignedDoctorId !== doctorId.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only manage appointments assigned directly to you.',
        };
      }

      const updated = {
        ...apt,
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.doctorNotes !== undefined ? { doctorNotes: updates.doctorNotes } : {}),
        ...(updates.diagnosis !== undefined ? { diagnosis: updates.diagnosis } : {}),
        ...(updates.prescription !== undefined ? { prescription: updates.prescription } : {}),
        ...(updates.followUpDate !== undefined ? { followUpDate: updates.followUpDate } : {}),
        ...(updates.cancellationReason !== undefined ? { cancellationReason: updates.cancellationReason } : {}),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.appointments[idx] = updated;

      const docObj = memoryStore.doctors.find(d => d._id === doctorId);
      const patObj = memoryStore.users.find(u => u._id === (apt.patient._id || apt.patient));
      const transferredFromObj = apt.transferredFrom ? memoryStore.doctors.find(d => d._id === (apt.transferredFrom._id || apt.transferredFrom)) : undefined;

      resultApt = {
        ...updated,
        doctor: docObj || doctorId,
        patient: patObj || apt.patient,
        transferredFrom: transferredFromObj || apt.transferredFrom,
      };
    } else {
      const current = await Appointment.findById(appointmentId);
      if (!current) {
        throw { statusCode: 404, message: 'Appointment not found' };
      }

      const assignedDoctorId = current.doctor.toString();
      if (assignedDoctorId !== doctorId.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only manage appointments assigned directly to you.',
        };
      }

      if (updates.status) current.status = updates.status;
      if (updates.doctorNotes !== undefined) current.doctorNotes = updates.doctorNotes;
      if (updates.diagnosis !== undefined) current.diagnosis = updates.diagnosis;
      if (updates.prescription !== undefined) current.prescription = updates.prescription;
      if (updates.followUpDate !== undefined) current.followUpDate = updates.followUpDate;
      if (updates.cancellationReason !== undefined) current.cancellationReason = updates.cancellationReason;

      await current.save();

      const populated = await Appointment.findById(appointmentId)
        .populate('doctor')
        .populate('transferredFrom')
        .populate('patient', '-password');

      resultApt = populated!.toObject() as unknown as IAppointment;
    }

    // If prescription or diagnosis is added or consultation completed, notify patient
    const patientId = (resultApt.patient as any)?._id || resultApt.patient;
    const docName = (resultApt.doctor as any)?.name || 'Your doctor';

    if (updates.diagnosis || updates.prescription || updates.status === 'Completed') {
      await NotificationService.createNotification({
        userId: patientId.toString(),
        recipientRole: 'patient',
        title: 'Consultation Summary Available',
        message: `${docName} has completed your consultation and recorded clinical diagnosis/prescriptions.`,
        type: 'appointment_completed',
        relatedId: resultApt._id,
        actionUrl: `/appointments/${resultApt._id}`,
      });
    }

    return resultApt;
  }

  // Doctor-to-Doctor Patient Transfer
  static async transferAppointment(
    appointmentId: string,
    requestingDoctorId: string,
    dto: TransferAppointmentDTO
  ): Promise<IAppointment> {
    const { targetDoctorId, transferReason, handoffNotes } = dto;

    if (!targetDoctorId || !transferReason) {
      throw { statusCode: 400, message: 'Target doctor and reason for transfer are required' };
    }

    if (targetDoctorId.toString() === requestingDoctorId.toString()) {
      throw { statusCode: 400, message: 'Cannot transfer a patient to yourself' };
    }

    let sourceDoc: any = null;
    let targetDoc: any = null;

    if (isUsingMemoryStore()) {
      sourceDoc = memoryStore.doctors.find(d => d._id === requestingDoctorId);
      targetDoc = memoryStore.doctors.find(d => d._id === targetDoctorId);
    } else {
      sourceDoc = await Doctor.findById(requestingDoctorId);
      targetDoc = await Doctor.findById(targetDoctorId);
    }

    if (!targetDoc) {
      throw { statusCode: 404, message: 'Target doctor not found or inactive' };
    }

    let resultApt: IAppointment;

    if (isUsingMemoryStore()) {
      const idx = memoryStore.appointments.findIndex(a => a._id === appointmentId);
      if (idx === -1) throw { statusCode: 404, message: 'Appointment not found' };

      const apt = memoryStore.appointments[idx];
      const assignedDoctorId = (apt.doctor._id || apt.doctor).toString();

      if (assignedDoctorId !== requestingDoctorId.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only transfer appointments currently assigned to you.',
        };
      }

      const existingNotes = apt.doctorNotes || '';
      const transferLog = `[Clinical Transfer on ${new Date().toLocaleDateString()}] Transferred from ${sourceDoc?.name || 'Doctor'} to ${targetDoc.name}. Reason: ${transferReason.trim()}${handoffNotes ? ` | Handoff Notes: ${handoffNotes.trim()}` : ''}`;
      const newDoctorNotes = existingNotes ? `${existingNotes}\n\n${transferLog}` : transferLog;

      const updated = {
        ...apt,
        doctor: targetDoctorId,
        transferredFrom: requestingDoctorId,
        transferReason: transferReason.trim(),
        transferredAt: new Date().toISOString(),
        doctorNotes: newDoctorNotes,
        updatedAt: new Date().toISOString(),
      };

      memoryStore.appointments[idx] = updated;

      const patObj = memoryStore.users.find(u => u._id === (apt.patient._id || apt.patient));

      resultApt = {
        ...updated,
        doctor: targetDoc,
        transferredFrom: sourceDoc || requestingDoctorId,
        patient: patObj || apt.patient,
      };
    } else {
      const current = await Appointment.findById(appointmentId);
      if (!current) throw { statusCode: 404, message: 'Appointment not found' };

      if (current.doctor.toString() !== requestingDoctorId.toString()) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only transfer appointments currently assigned to you.',
        };
      }

      const existingNotes = current.doctorNotes || '';
      const transferLog = `[Clinical Transfer on ${new Date().toLocaleDateString()}] Transferred from ${sourceDoc?.name || 'Doctor'} to ${targetDoc.name}. Reason: ${transferReason.trim()}${handoffNotes ? ` | Handoff Notes: ${handoffNotes.trim()}` : ''}`;
      current.doctorNotes = existingNotes ? `${existingNotes}\n\n${transferLog}` : transferLog;

      current.doctor = targetDoctorId as any;
      current.transferredFrom = requestingDoctorId as any;
      current.transferReason = transferReason.trim();
      current.transferredAt = new Date();

      await current.save();

      const populated = await Appointment.findById(appointmentId)
        .populate('doctor')
        .populate('transferredFrom')
        .populate('patient', '-password');

      resultApt = populated!.toObject() as unknown as IAppointment;
    }

    const patientObj: any = resultApt.patient;
    const patientName = patientObj?.name || 'The patient';
    const patientId = patientObj?._id || patientObj;

    // 1. Notify Target Doctor
    let targetDocUserId = targetDoc.userId;
    if (!targetDocUserId && isUsingMemoryStore()) {
      const docUser = memoryStore.users.find(u => u.doctorId === targetDoctorId);
      if (docUser) targetDocUserId = docUser._id;
    }

    if (targetDocUserId) {
      await NotificationService.createNotification({
        userId: targetDocUserId,
        recipientRole: 'doctor',
        title: 'Patient Transferred to Your Care',
        message: `${sourceDoc?.name || 'A colleague'} transferred ${patientName} (${resultApt.date} at ${resultApt.time}) to your schedule. Reason: "${transferReason.trim()}"`,
        type: 'appointment_transferred',
        relatedId: resultApt._id,
        actionUrl: '/doctor/appointments',
      });
    }

    // 2. Notify Patient
    await NotificationService.createNotification({
      userId: patientId.toString(),
      recipientRole: 'patient',
      title: 'Consultation Transferred',
      message: `Your appointment on ${resultApt.date} at ${resultApt.time} has been transferred to ${targetDoc.name} (${targetDoc.specialty}, ${targetDoc.department}).`,
      type: 'appointment_transferred',
      relatedId: resultApt._id,
      actionUrl: `/appointments/${resultApt._id}`,
    });

    // 3. Notify Admin
    await NotificationService.broadcastToAdmins(
      'Clinical Patient Transfer',
      `${patientName} was transferred from ${sourceDoc?.name || 'Dr. Source'} to ${targetDoc.name} in ${targetDoc.department}.`,
      resultApt._id,
      'appointment_transferred'
    );

    return resultApt;
  }

  static async getDoctorStats(doctorId: string): Promise<any> {
    const all = await this.getDoctorAppointments(doctorId);
    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = all.filter(a => a.date === todayStr);
    const pendingAppointments = all.filter(a => a.status === 'Pending');
    const confirmedAppointments = all.filter(a => a.status === 'Confirmed');
    const completedAppointments = all.filter(a => a.status === 'Completed');
    const cancelledAppointments = all.filter(a => a.status === 'Cancelled');

    const patientIds = new Set<string>();
    all.forEach(a => {
      const pId = (a.patient as any)?._id || a.patient;
      if (pId) patientIds.add(pId.toString());
    });

    const now = new Date();
    const upcomingList = all.filter(a => {
      if (a.status === 'Cancelled' || a.status === 'Completed') return false;
      const aptDate = new Date(`${a.date} ${a.time}`);
      return isNaN(aptDate.getTime()) ? a.date >= todayStr : aptDate >= now || a.date >= todayStr;
    });

    upcomingList.sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

    return {
      totalAppointments: all.length,
      todayCount: todayAppointments.length,
      todayCompleted: todayAppointments.filter(a => a.status === 'Completed').length,
      pendingCount: pendingAppointments.length,
      confirmedCount: confirmedAppointments.length,
      completedCount: completedAppointments.length,
      cancelledCount: cancelledAppointments.length,
      totalPatients: patientIds.size,
      nextAppointment: upcomingList.length > 0 ? upcomingList[0] : null,
      upcomingCount: upcomingList.length,
    };
  }

  // Admin: View ALL hospital appointments
  static async getAllHospitalAppointments(filters?: {
    doctorId?: string;
    department?: string;
    status?: string;
    date?: string;
    search?: string;
  }): Promise<{ appointments: IAppointment[]; total: number }> {
    if (isUsingMemoryStore()) {
      let list = [...memoryStore.appointments];

      if (filters?.doctorId && filters.doctorId !== 'all') {
        list = list.filter(a => (a.doctor._id || a.doctor).toString() === filters.doctorId);
      }

      if (filters?.status && filters.status !== 'all') {
        list = list.filter(a => a.status.toLowerCase() === filters.status!.toLowerCase());
      }

      if (filters?.date) {
        list = list.filter(a => a.date === filters.date);
      }

      let populated = list.map(apt => {
        const docObj = memoryStore.doctors.find(d => d._id === (apt.doctor._id || apt.doctor));
        const patObj = memoryStore.users.find(u => u._id === (apt.patient._id || apt.patient));
        const transferredFromObj = apt.transferredFrom ? memoryStore.doctors.find(d => d._id === (apt.transferredFrom._id || apt.transferredFrom)) : undefined;
        return {
          ...apt,
          doctor: docObj || apt.doctor,
          patient: patObj || apt.patient,
          transferredFrom: transferredFromObj || apt.transferredFrom,
        };
      });

      if (filters?.department && filters.department !== 'all') {
        populated = populated.filter(a => {
          const docDept = (a.doctor as any)?.department;
          return docDept && docDept.toLowerCase() === filters.department!.toLowerCase();
        });
      }

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        populated = populated.filter(a => {
          const pName = (a.patient as any)?.name?.toLowerCase() || '';
          const dName = (a.doctor as any)?.name?.toLowerCase() || '';
          const reason = a.reason?.toLowerCase() || '';
          const diagnosis = a.diagnosis?.toLowerCase() || '';
          return pName.includes(q) || dName.includes(q) || reason.includes(q) || diagnosis.includes(q);
        });
      }

      populated.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

      return {
        appointments: populated,
        total: populated.length,
      };
    }

    const query: any = {};
    if (filters?.doctorId && filters.doctorId !== 'all') query.doctor = filters.doctorId;
    if (filters?.status && filters.status !== 'all') query.status = filters.status;
    if (filters?.date) query.date = filters.date;

    let appointments = await Appointment.find(query)
      .populate('doctor')
      .populate('transferredFrom')
      .populate('patient', '-password')
      .sort({ date: -1, createdAt: -1 });

    let result = appointments.map(a => a.toObject() as unknown as IAppointment);

    if (filters?.department && filters.department !== 'all') {
      result = result.filter(a => {
        const docDept = (a.doctor as any)?.department;
        return docDept && docDept.toLowerCase() === filters.department!.toLowerCase();
      });
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(a => {
        const pName = (a.patient as any)?.name?.toLowerCase() || '';
        const dName = (a.doctor as any)?.name?.toLowerCase() || '';
        const reason = a.reason?.toLowerCase() || '';
        const diagnosis = a.diagnosis?.toLowerCase() || '';
        return pName.includes(q) || dName.includes(q) || reason.includes(q) || diagnosis.includes(q);
      });
    }

    return {
      appointments: result,
      total: result.length,
    };
  }

  // Admin Hospital Stats
  static async getAdminHospitalStats(): Promise<any> {
    const { appointments } = await this.getAllHospitalAppointments();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayApts = appointments.filter(a => a.date === todayStr);
    const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

    // Breakdown by department
    const deptMap: Record<string, number> = {};
    appointments.forEach(a => {
      const dept = (a.doctor as any)?.department || 'General Medicine';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    let totalRevenue = 0;
    appointments.forEach(a => {
      if (a.status === 'Completed' || a.status === 'Confirmed') {
        const fee = (a.doctor as any)?.consultationFee || 10000;
        totalRevenue += fee;
      }
    });

    return {
      totalAppointments: appointments.length,
      todayAppointmentsCount: todayApts.length,
      confirmedCount,
      completedCount,
      pendingCount,
      cancelledCount,
      totalRevenue,
      departmentBreakdown: deptMap,
    };
  }

  static async rescheduleAppointment(
    appointmentId: string,
    requestingUserId: string,
    data: RescheduleAppointmentDTO
  ): Promise<IAppointment> {
    const { date, time, reason, notes } = data;

    if (!date || !time) {
      throw { statusCode: 400, message: 'New date and time are required for rescheduling' };
    }

    const currentApt = await this.getAppointmentById(appointmentId, requestingUserId);

    if (currentApt.status === 'Cancelled') {
      throw { statusCode: 400, message: 'Cancelled appointments cannot be rescheduled. Please book a new appointment.' };
    }

    if (currentApt.status === 'Completed') {
      throw { statusCode: 400, message: 'Completed appointments cannot be rescheduled.' };
    }

    const doctorId = (currentApt.doctor as any)._id
      ? (currentApt.doctor as any)._id.toString()
      : currentApt.doctor.toString();

    const availability = await DoctorService.getDoctorAvailability(doctorId, date);
    if (!availability.isWorkingDay) {
      throw {
        statusCode: 400,
        message: `The doctor is not scheduled to work on ${availability.dayOfWeek}s.`,
      };
    }

    const normalizedTime = time.trim();
    const matchingSlot = availability.slots.find(
      s => s.time.toUpperCase() === normalizedTime.toUpperCase()
    );

    if (!matchingSlot) {
      throw {
        statusCode: 400,
        message: `The selected time (${time}) is not within the doctor's working schedule.`,
      };
    }

    const isSameSlot = currentApt.date === date && currentApt.time === matchingSlot.time;
    if (!isSameSlot && !matchingSlot.isAvailable) {
      throw {
        statusCode: 409,
        message: `The selected slot (${time} on ${date}) is no longer available. Please select another time.`,
      };
    }

    let updatedApt: IAppointment;

    if (isUsingMemoryStore()) {
      const idx = memoryStore.appointments.findIndex(a => a._id === appointmentId);
      if (idx === -1) throw { statusCode: 404, message: 'Appointment not found' };

      const updated = {
        ...memoryStore.appointments[idx],
        date,
        time: matchingSlot.time,
        reason: reason ? reason.trim() : memoryStore.appointments[idx].reason,
        notes: notes !== undefined ? notes.trim() : memoryStore.appointments[idx].notes,
        status: 'Confirmed',
        updatedAt: new Date().toISOString(),
      };

      memoryStore.appointments[idx] = updated;

      const docObj = memoryStore.doctors.find(d => d._id === doctorId);
      const patObj = memoryStore.users.find(u => u._id === requestingUserId);

      updatedApt = {
        ...updated,
        doctor: docObj || doctorId,
        patient: patObj || requestingUserId,
      };
    } else {
      const updated = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          date,
          time: matchingSlot.time,
          ...(reason ? { reason: reason.trim() } : {}),
          ...(notes !== undefined ? { notes: notes.trim() } : {}),
          status: 'Confirmed',
        },
        { new: true }
      )
        .populate('doctor')
        .populate('transferredFrom')
        .populate('patient', '-password');

      updatedApt = updated!.toObject() as unknown as IAppointment;
    }

    // Notify Doctor of rescheduled appointment
    const docObj: any = updatedApt.doctor;
    let doctorUserId = docObj?.userId;
    if (!doctorUserId && isUsingMemoryStore()) {
      const docUser = memoryStore.users.find(u => u.doctorId === doctorId);
      if (docUser) doctorUserId = docUser._id;
    }

    if (doctorUserId) {
      await NotificationService.createNotification({
        userId: doctorUserId,
        recipientRole: 'doctor',
        title: 'Appointment Rescheduled',
        message: `${(updatedApt.patient as any)?.name || 'Patient'} rescheduled their consultation to ${date} at ${matchingSlot.time}.`,
        type: 'appointment_reminder',
        relatedId: updatedApt._id,
        actionUrl: '/doctor/appointments',
      });
    }

    return updatedApt;
  }

  static async cancelAppointment(
    appointmentId: string,
    requestingUserId: string,
    cancellationReason?: string
  ): Promise<IAppointment> {
    const currentApt = await this.getAppointmentById(appointmentId, requestingUserId);

    if (currentApt.status === 'Cancelled') {
      return currentApt;
    }

    let updatedApt: IAppointment;

    if (isUsingMemoryStore()) {
      const idx = memoryStore.appointments.findIndex(a => a._id === appointmentId);
      if (idx === -1) throw { statusCode: 404, message: 'Appointment not found' };

      const updated = {
        ...memoryStore.appointments[idx],
        status: 'Cancelled',
        cancellationReason: cancellationReason || 'Cancelled by patient',
        updatedAt: new Date().toISOString(),
      };
      memoryStore.appointments[idx] = updated;

      const doctorId = (currentApt.doctor as any)._id || currentApt.doctor;
      const docObj = memoryStore.doctors.find(d => d._id === doctorId);
      const patObj = memoryStore.users.find(u => u._id === requestingUserId);

      updatedApt = {
        ...updated,
        doctor: docObj || doctorId,
        patient: patObj || requestingUserId,
      };
    } else {
      const updated = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status: 'Cancelled',
          cancellationReason: cancellationReason || 'Cancelled by patient',
        },
        { new: true }
      )
        .populate('doctor')
        .populate('transferredFrom')
        .populate('patient', '-password');

      updatedApt = updated!.toObject() as unknown as IAppointment;
    }

    const doctorObj: any = updatedApt.doctor;
    const patientObj: any = updatedApt.patient;
    const doctorId = doctorObj?._id || updatedApt.doctor;

    let doctorUserId = doctorObj?.userId;
    if (!doctorUserId && isUsingMemoryStore()) {
      const docUser = memoryStore.users.find(u => u.doctorId === doctorId);
      if (docUser) doctorUserId = docUser._id;
    }

    if (doctorUserId) {
      await NotificationService.createNotification({
        userId: doctorUserId,
        recipientRole: 'doctor',
        title: 'Appointment Cancelled',
        message: `${patientObj?.name || 'Patient'} cancelled their appointment on ${updatedApt.date} at ${updatedApt.time}.`,
        type: 'appointment_cancelled',
        relatedId: updatedApt._id,
        actionUrl: '/doctor/appointments',
      });
    }

    await NotificationService.broadcastToAdmins(
      'Appointment Cancelled',
      `${patientObj?.name || 'Patient'} cancelled their visit with ${doctorObj?.name || 'Doctor'} on ${updatedApt.date}.`,
      updatedApt._id,
      'appointment_cancelled'
    );

    return updatedApt;
  }

  static async getDashboardStats(userId: string): Promise<AppointmentStats> {
    const all = await this.getPatientAppointments(userId);
    const now = new Date();

    const upcomingList = all.filter(a => {
      if (a.status === 'Cancelled' || a.status === 'Completed') return false;
      const aptDate = new Date(`${a.date} ${a.time}`);
      return isNaN(aptDate.getTime()) ? true : aptDate >= now || a.date >= now.toISOString().split('T')[0];
    });

    const confirmedCount = all.filter(a => a.status === 'Confirmed').length;
    const completedCount = all.filter(a => a.status === 'Completed').length;
    const cancelledCount = all.filter(a => a.status === 'Cancelled').length;

    upcomingList.sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
    const nextAppointment = upcomingList.length > 0 ? upcomingList[0] : null;

    return {
      total: all.length,
      upcoming: upcomingList.length,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
      nextAppointment,
    };
  }
}
