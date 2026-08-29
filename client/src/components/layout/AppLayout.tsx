import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, HeartPulse, CalendarPlus, ShieldCheck, Stethoscope } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/appointments')) return 'Hospital Appointments Oversight';
    if (path.startsWith('/admin/doctors')) return 'Doctor Governance & Roster';
    if (path.startsWith('/admin/users')) return 'Registered Users & Accounts';
    if (path.startsWith('/admin')) return 'Administration & Hospital Operations';
    if (path.startsWith('/doctor/appointments')) return 'Clinical Consultations & Transfers';
    if (path.startsWith('/doctor/schedule')) return 'My Clinical Working Hours';
    if (path.startsWith('/doctor/dashboard')) return 'Doctor Clinical Workspace';
    if (path.startsWith('/dashboard')) return 'Patient Dashboard';
    if (path.startsWith('/doctors')) return 'Medical Specialists & Doctors';
    if (path.startsWith('/appointments')) return 'My Appointments';
    if (path.startsWith('/schedule')) return 'Schedule an Appointment';
    if (path.startsWith('/profile')) return 'Profile & Records';
    if (path.startsWith('/settings')) return 'Account & Security Settings';
    return 'SmartCare Hospital Management';
  };

  const isRoleAdmin = user?.role === 'admin';
  const isRoleDoctor = user?.role === 'doctor';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar for Authenticated View */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="app-mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Logo */}
            <Link to={isRoleDoctor ? '/doctor/dashboard' : isRoleAdmin ? '/admin' : '/dashboard'} className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">SmartCare</span>
            </Link>

            {/* Desktop Page Title Breadcrumb */}
            <div className="hidden lg:block">
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Dropdown */}
            <NotificationDropdown />

            {/* Role-adaptive Quick Action (Patients can book; Admins & Doctors do not book) */}
            {!isRoleAdmin && !isRoleDoctor && (
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-600/20 transition-all hover:scale-[1.02]"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Book Visit</span>
                <span className="sm:hidden">Book</span>
              </Link>
            )}

            {isRoleAdmin && (
              <Link
                to="/admin/appointments"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>All Appointments</span>
              </Link>
            )}

            {isRoleDoctor && (
              <Link
                to="/doctor/appointments"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200/80 rounded-xl hover:bg-teal-100 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>My Consultations</span>
              </Link>
            )}

            <Link
              to="/settings"
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                isRoleDoctor ? 'bg-indigo-600' : isRoleAdmin ? 'bg-amber-600' : 'bg-teal-600'
              }`}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-700 max-w-[110px] truncate">
                {user?.name?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
