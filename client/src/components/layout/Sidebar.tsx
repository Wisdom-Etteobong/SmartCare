import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarPlus,
  User,
  Settings,
  LogOut,
  HeartPulse,
  X,
  ChevronRight,
  Stethoscope,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success('You have been logged out safely.');
    navigate('/login');
  };

  const userRole = user?.role || 'patient';

  // Role-specific navigation items
  const getNavItems = () => {
    if (userRole === 'doctor') {
      return [
        {
          name: 'Doctor Portal',
          path: '/doctor/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Assigned Patients',
          path: '/doctor/appointments',
          icon: Users,
        },
        {
          name: 'My Working Hours',
          path: '/doctor/schedule',
          icon: Clock,
        },
        {
          name: 'Colleague Directory',
          path: '/doctors',
          icon: Stethoscope,
        },
        {
          name: 'Doctor Profile',
          path: '/profile',
          icon: User,
        },
        {
          name: 'Portal Settings',
          path: '/settings',
          icon: Settings,
        },
      ];
    }

    if (userRole === 'admin') {
      return [
        {
          name: 'Hospital Dashboard',
          path: '/admin',
          icon: LayoutDashboard,
        },
        {
          name: 'All Appointments',
          path: '/admin/appointments',
          icon: FileSpreadsheet,
        },
        {
          name: 'Doctor Governance',
          path: '/admin/doctors',
          icon: ShieldCheck,
        },
        {
          name: 'User Management',
          path: '/admin/users',
          icon: UserCheck,
        },
        {
          name: 'Staff Directory',
          path: '/doctors',
          icon: Users,
        },
        {
          name: 'System Settings',
          path: '/settings',
          icon: Settings,
        },
      ];
    }

    // Default Patient Portal navigation
    return [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Find Doctors',
        path: '/doctors',
        icon: Users,
      },
      {
        name: 'My Appointments',
        path: '/appointments',
        icon: Calendar,
      },
      {
        name: 'Schedule Visit',
        path: '/schedule',
        icon: CalendarPlus,
      },
      {
        name: 'Medical Profile',
        path: '/profile',
        icon: User,
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
      },
    ];
  };

  const navItems = getNavItems();

  const getPortalTitle = () => {
    if (userRole === 'doctor') return 'Doctor Portal';
    if (userRole === 'admin') return 'Admin Console';
    return 'Patient Portal';
  };

  const getHomeLink = () => {
    if (userRole === 'doctor') return '/doctor/dashboard';
    if (userRole === 'admin') return '/admin';
    return '/dashboard';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <NavLink
          to={getHomeLink()}
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
              Smart<span className="text-teal-600">Care</span>
            </span>
            <span className="text-[11px] font-bold text-teal-600 tracking-wider uppercase">
              {getPortalTitle()}
            </span>
          </div>
        </NavLink>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {userRole === 'doctor' ? 'Clinical Navigation' : userRole === 'admin' ? 'Administration & Oversight' : 'Patient Menu'}
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Card & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-xs mb-3">
          <div className={`w-9 h-9 rounded-full font-black flex items-center justify-center text-sm ${
            userRole === 'doctor'
              ? 'bg-teal-100 text-teal-800'
              : userRole === 'admin'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-teal-50 text-teal-700'
          }`}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider ${
                userRole === 'doctor'
                  ? 'bg-teal-100 text-teal-800'
                  : userRole === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {userRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
