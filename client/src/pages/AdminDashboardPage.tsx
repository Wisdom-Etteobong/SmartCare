import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  Stethoscope,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { IAppointment } from '../../../package/src/types/appointment';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, aptsRes] = await Promise.all([
        api.get('/appointments/admin/stats'),
        api.get('/appointments/admin/all'),
      ]);

      if (statsRes.data?.data?.stats) {
        setStats(statsRes.data.data.stats);
      }
      if (aptsRes.data?.data?.appointments) {
        setRecentAppointments(aptsRes.data.data.appointments.slice(0, 6));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hospital operations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Hospital Administration Overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hospital Governance & System Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Monitor real-time patient appointments across all departments, supervise clinical doctor rosters, and govern system user permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalAppointments || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all medical departments</p>
          </div>
        </div>

        {/* Today's Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Schedule</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats?.todayAppointmentsCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled for today</p>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Visits</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats?.completedCount || 0}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Consultations completed</p>
          </div>
        </div>

        {/* Confirmed / Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Upcoming</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats?.confirmedCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting doctor consultation</p>
          </div>
        </div>
      </div>

      {/* Quick Governance Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/appointments"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition group flex items-start justify-between"
        >
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
              All Hospital Appointments
            </h3>
            <p className="text-xs text-slate-500">
              Inspect all booked patient appointments, filter by doctor or department, and view transfer logs.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition shrink-0 mt-2" />
        </Link>

        <Link
          to="/admin/doctors"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition group flex items-start justify-between"
        >
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
              Doctor Governance Roster
            </h3>
            <p className="text-xs text-slate-500">
              Manage clinical doctor profiles, update availability slots, consultation fees, and specialties.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition shrink-0 mt-2" />
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition group flex items-start justify-between"
        >
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 w-fit">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition">
              Registered Users & Accounts
            </h3>
            <p className="text-xs text-slate-500">
              Supervise registered patients and staff accounts, toggle active status, and manage roles.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition shrink-0 mt-2" />
        </Link>
      </div>

      {/* Main Grid: Department Breakdown & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Department Workload</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Bookings</span>
          </div>

          <div className="space-y-3">
            {stats?.departmentBreakdown && Object.keys(stats.departmentBreakdown).length > 0 ? (
              Object.entries(stats.departmentBreakdown).map(([dept, count]: any) => {
                const percentage = Math.round((count / (stats.totalAppointments || 1)) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{dept}</span>
                      <span className="text-slate-900 font-bold">{count} visits ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No department activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Hospital Appointments */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Recent Hospital Appointments</h2>
            </div>
            <Link
              to="/admin/appointments"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All ({stats?.totalAppointments || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No appointments found in the system.</p>
            ) : (
              recentAppointments.map(apt => {
                const patientName = (apt.patient as any)?.name || 'Patient';
                const doctorName = (apt.doctor as any)?.name || 'Doctor';
                const department = (apt.doctor as any)?.department || 'General';

                return (
                  <div key={apt._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {patientName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {patientName}{' '}
                          <span className="font-normal text-slate-400">with</span>{' '}
                          <span className="text-slate-700">{doctorName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {department} • {apt.date} at {apt.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
