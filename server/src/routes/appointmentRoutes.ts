import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken, requireDoctor, requireAdmin } from '../middleware/auth';

const router = Router();

// All appointment routes are protected and strictly require authentication
router.use(authenticateToken);

// Admin Hospital Appointments Oversight
router.get('/admin/all', requireAdmin, AppointmentController.getAllHospitalAppointments);
router.get('/admin/stats', requireAdmin, AppointmentController.getAdminHospitalStats);

// Doctor Portal Specific Routes (Requires 'doctor' or 'admin' role)
router.get('/doctor', requireDoctor, AppointmentController.getDoctorAppointments);
router.get('/doctor/stats', requireDoctor, AppointmentController.getDoctorStats);
router.post('/doctor/:id/transfer', requireDoctor, AppointmentController.transferAppointment);
router.patch('/doctor/:id', requireDoctor, AppointmentController.updateDoctorAppointment);

// Patient / Shared Appointment Routes
router.post('/', AppointmentController.createAppointment);
router.get('/', AppointmentController.getMyAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.patch('/:id', AppointmentController.rescheduleAppointment);
router.patch('/:id/cancel', AppointmentController.cancelAppointment);
router.delete('/:id', AppointmentController.cancelAppointment);

export default router;
