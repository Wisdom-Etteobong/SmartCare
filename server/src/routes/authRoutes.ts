import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPasswordWithOtp);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateToken, AuthController.getMe);
router.patch('/profile', authenticateToken, AuthController.updateProfile);
router.post('/change-first-password', authenticateToken, AuthController.changeFirstPassword);

// Admin-only user management
router.get('/admin/users', authenticateToken, requireAdmin, AuthController.listUsers);
router.patch('/admin/users/:id', authenticateToken, requireAdmin, AuthController.updateUserByAdmin);
router.delete('/admin/users/:id', authenticateToken, requireAdmin, AuthController.deleteUserByAdmin);
router.post('/admin/reset-password', authenticateToken, requireAdmin, AuthController.resetPassword);

export default router;
