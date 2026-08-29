import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctorService';

export class DoctorController {
  static async getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, specialty, day, department } = req.query;
      const doctors = await DoctorService.getDoctors({
        search: search as string,
        specialty: specialty as string,
        day: day as string,
        department: department as string,
      });

      res.json({
        success: true,
        count: doctors.length,
        data: { doctors },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id);
      res.json({
        success: true,
        data: { doctor },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date } = req.query;
      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Query parameter "date" (YYYY-MM-DD) is required',
        });
        return;
      }

      const availability = await DoctorService.getDoctorAvailability(
        req.params.id,
        date as string
      );

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin / Doctor Management
  static async createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctor, credentials } = req.body;
      const result = await DoctorService.createDoctor(doctor || req.body, credentials);
      res.status(201).json({
        success: true,
        message: 'Doctor account and profile provisioned successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Doctor profile updated successfully',
        data: { doctor },
      });
    } catch (error) {
      next(error);
    }
  }
}

