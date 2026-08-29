import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { authenticateToken, requireAdmin, requireDoctor } from '../middleware/auth';

const router = Router();

// Public routes (guests and authenticated users can view)
router.get('/', DoctorController.getDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.get('/:id/availability', DoctorController.getDoctorAvailability);

// Admin-restricted: Add new doctor accounts
router.post('/', authenticateToken, requireAdmin, DoctorController.createDoctor);

// Doctor or Admin: Update profile / availability
router.patch('/:id', authenticateToken, requireDoctor, DoctorController.updateDoctor);

export default router;

