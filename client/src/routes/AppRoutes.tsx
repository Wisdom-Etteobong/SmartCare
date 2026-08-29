import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { AdaptiveLayout } from '../components/layout/AdaptiveLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public & Patient Pages
import { HomePage } from '../pages/HomePage';
import { DoctorsPage } from '../pages/DoctorsPage';
import { DoctorDetailsPage } from '../pages/DoctorDetailsPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { AppointmentDetailsPage } from '../pages/AppointmentDetailsPage';
import { SchedulePage } from '../pages/SchedulePage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Doctor Portal Pages
import { DoctorDashboardPage } from '../pages/DoctorDashboardPage';
import { DoctorSchedulePage } from '../pages/DoctorSchedulePage';

// Admin Portal Pages
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminAppointmentsPage } from '../pages/AdminAppointmentsPage';
import { AdminDoctorsPage } from '../pages/AdminDoctorsPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Adaptive Pages: Retains authenticated sidebar & layout when logged in, renders public layout for guests */}
      <Route element={<AdaptiveLayout />}>
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
      </Route>

      {/* Public Pages with Public Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Doctor Portal Pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/appointments" element={<DoctorDashboardPage />} />
        <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
      </Route>

      {/* Protected Admin Portal Pages (Governance & Oversight ONLY - No booking) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      {/* Protected Patient & Shared Portal Pages */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Route>

      {/* Shared Profile & Settings for all authenticated roles */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
