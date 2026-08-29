import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AppointmentController {
  static async createAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user._id || req.user.id;
      const appointment = await AppointmentService.createAppointment(patientId, req.body);

      res.status(201).json({
        success: true,
        message: 'Appointment successfully scheduled',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user._id || req.user.id;
      const { status } = req.query;
      const appointments = await AppointmentService.getPatientAppointments(
        patientId,
        status as string
      );

      res.json({
        success: true,
        count: appointments.length,
        data: { appointments },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestingUser = {
        id: req.user._id || req.user.id,
        role: req.user.role,
        doctorId: req.user.doctorId,
      };
      const appointment = await AppointmentService.getAppointmentByIdSecure(
        req.params.id,
        requestingUser
      );

      res.json({
        success: true,
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  static async rescheduleAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user._id || req.user.id;
      const appointment = await AppointmentService.rescheduleAppointment(
        req.params.id,
        patientId,
        req.body
      );

      res.json({
        success: true,
        message: 'Appointment successfully rescheduled',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user._id || req.user.id;
      const { reason } = req.body;
      const appointment = await AppointmentService.cancelAppointment(
        req.params.id,
        patientId,
        reason
      );

      res.json({
        success: true,
        message: 'Appointment successfully cancelled',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  // Doctor Portal Methods
  static async getDoctorAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.user.doctorId || req.query.doctorId;
      if (!doctorId) {
        res.status(400).json({
          success: false,
          message: 'No doctor profile is associated with this account.',
        });
        return;
      }

      const { status, date, search } = req.query;
      const appointments = await AppointmentService.getDoctorAppointments(
        doctorId.toString(),
        {
          status: status as string,
          date: date as string,
          search: search as string,
        }
      );

      res.json({
        success: true,
        count: appointments.length,
        data: { appointments },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctorAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.user.doctorId || req.body.doctorId;
      if (!doctorId) {
        res.status(400).json({
          success: false,
          message: 'No doctor profile is associated with this account.',
        });
        return;
      }

      const appointment = await AppointmentService.updateDoctorAppointment(
        req.params.id,
        doctorId.toString(),
        req.body
      );

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  // Doctor-to-Doctor Patient Transfer
  static async transferAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.user.doctorId || req.body.doctorId;
      if (!doctorId) {
        res.status(400).json({
          success: false,
          message: 'No doctor profile is associated with this account.',
        });
        return;
      }

      const appointment = await AppointmentService.transferAppointment(
        req.params.id,
        doctorId.toString(),
        req.body
      );

      res.json({
        success: true,
        message: 'Patient appointment successfully transferred to colleague.',
        data: { appointment },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.user.doctorId || req.query.doctorId;
      if (!doctorId) {
        res.status(400).json({
          success: false,
          message: 'No doctor profile is associated with this account.',
        });
        return;
      }

      const stats = await AppointmentService.getDoctorStats(doctorId.toString());

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin Appointments Oversight Methods
  static async getAllHospitalAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { doctorId, department, status, date, search } = req.query;
      const result = await AppointmentService.getAllHospitalAppointments({
        doctorId: doctorId as string,
        department: department as string,
        status: status as string,
        date: date as string,
        search: search as string,
      });

      res.json({
        success: true,
        count: result.total,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminHospitalStats(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AppointmentService.getAdminHospitalStats();
      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}
