import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { AuthenticatedRequest } from '../middleware/auth';

export class DashboardController {
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId = req.user._id || req.user.id;
      const stats = await AppointmentService.getDashboardStats(patientId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}
