import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  HeartPulse,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AppointmentStats, IAppointment } from '../../../package/src/types/appointment';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/appointments'),
        ]);

        if (statsRes.data?.data?.stats) {
          setStats(statsRes.data.data.stats);
        }

        if (appointmentsRes.data?.data?.appointments) {
          setRecentAppointments(appointmentsRes.data.data.appointments.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Preparing your health dashboard..." />;
  }

  const nextApt = stats?.nextAppointment;
  const nextDoctor = nextApt && typeof nextApt.doctor === 'object' ? (nextApt.doctor as any) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-900/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/60 border border-teal-500/50 text-teal-100 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-sm text-teal-100 max-w-xl">
            You have <strong className="text-white font-bold">{stats?.upcoming || 0} active appointment{(stats?.upcoming || 0) === 1 ? '' : 's'}</strong> scheduled. Manage your visits or bypass hospital queues by booking new consultations below.
          </p>
        </div>

        <Link
          to="/schedule"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-teal-800 font-extrabold text-sm shadow-md transition-all hover:scale-102 shrink-0"
        >
          <CalendarPlus className="w-4 h-4 text-teal-600" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.upcoming || 0}</p>
          <span className="text-[11px] text-teal-600 font-semibold block">Scheduled consultations</span>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.confirmed || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold block">Ready for check-in</span>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.completed || 0}</p>
          <span className="text-[11px] text-blue-600 font-semibold block">Consultations concluded</span>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cancelled</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.cancelled || 0}</p>
          <span className="text-[11px] text-slate-400 font-semibold block">Released queue slots</span>
        </div>
      </div>

      {/* Main Row: Next Upcoming Appointment Highlight + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Appointment Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Next Upcoming Appointment</span>
            </h3>
            {nextApt && <StatusBadge status={nextApt.status} size="sm" />}
          </div>

          {nextApt ? (
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      nextDoctor?.profileImage ||
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
                    }
                    alt={nextDoctor?.name || 'Doctor'}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-teal-200 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                      {nextDoctor?.specialty}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{nextDoctor?.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{nextDoctor?.department || 'Outpatient Clinic'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    Scheduled Time
                  </span>
                  <p className="text-sm font-extrabold text-teal-800">{nextApt.date}</p>
                  <p className="text-xs font-bold text-slate-700">{nextApt.time}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <p className="text-slate-600 line-clamp-1">
                  <strong>Reason:</strong> {nextApt.reason}
                </p>
                <Link
                  to={`/appointments/${nextApt._id}`}
                  className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs shrink-0"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <HeartPulse className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-bold text-slate-800 text-sm">No Upcoming Appointments</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You are all caught up! Book a consultation whenever you need medical care.
                </p>
              </div>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule Now</span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Hub Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Hospital Services</h3>

          <div className="space-y-2">
            <Link
              to="/doctors"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700">Browse Doctors</h4>
                  <p className="text-xs text-slate-400">View specialties & hours</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>

            <Link
              to="/appointments"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700">My Appointments</h4>
                  <p className="text-xs text-slate-400">Manage bookings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700">Patient Record</h4>
                  <p className="text-xs text-slate-400">Update medical profile</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Appointments Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your most recent appointment history</p>
          </div>
          <Link
            to="/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            View All ({recentAppointments.length})
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No recent appointment history.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAppointments.map(apt => {
              const doc = typeof apt.doctor === 'object' ? (apt.doctor as any) : null;
              return (
                <div
                  key={apt._id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        doc?.profileImage ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={doc?.name || 'Doctor'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{doc?.name || 'Doctor'}</h4>
                      <p className="text-xs text-slate-400">{doc?.specialty} • {apt.date} at {apt.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <StatusBadge status={apt.status} size="sm" />
                    <Link
                      to={`/appointments/${apt._id}`}
                      className="text-xs font-bold text-slate-600 hover:text-teal-600 p-1 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
