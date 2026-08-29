import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { IAppointment, AppointmentStatus } from '../../../package/src/types/appointment';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { RescheduleModal } from '../components/appointments/RescheduleModal';
import { CancelModal } from '../components/appointments/CancelModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [rescheduleTarget, setRescheduleTarget] = useState<IAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<IAppointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.data?.data?.appointments) {
        setAppointments(res.data.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter list by tab & search query
  const filteredAppointments = appointments.filter(apt => {
    // Status tab filter
    if (activeTab === 'Upcoming') {
      if (apt.status === 'Cancelled' || apt.status === 'Completed') return false;
    } else if (activeTab !== 'All' && apt.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const docName = typeof apt.doctor === 'object' ? (apt.doctor as any).name?.toLowerCase() : '';
      const docSpec = typeof apt.doctor === 'object' ? (apt.doctor as any).specialty?.toLowerCase() : '';
      const reason = (apt.reason || '').toLowerCase();
      return docName.includes(q) || docSpec.includes(q) || reason.includes(q);
    }

    return true;
  });

  const tabs = [
    { label: 'All', value: 'All', count: appointments.length },
    {
      label: 'Upcoming',
      value: 'Upcoming',
      count: appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length,
    },
    {
      label: 'Confirmed',
      value: 'Confirmed',
      count: appointments.filter(a => a.status === 'Confirmed').length,
    },
    {
      label: 'Completed',
      value: 'Completed',
      count: appointments.filter(a => a.status === 'Completed').length,
    },
    {
      label: 'Cancelled',
      value: 'Cancelled',
      count: appointments.filter(a => a.status === 'Cancelled').length,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review, reschedule, or cancel your scheduled hospital consultations.
          </p>
        </div>

        <Link
          to="/schedule"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs transition-all w-fit"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Schedule New</span>
        </Link>
      </div>

      {/* Tabs & Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tab.value
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input inside list */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointments by doctor, specialty, or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-medium text-slate-800 outline-hidden"
          />
        </div>
      </div>

      {/* Appointments Grid */}
      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filteredAppointments.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Appointments Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'All'
                ? "You don't have any appointments booked yet. Schedule a visit to skip the hospital queue!"
                : `No appointments matching the "${activeTab}" filter.`}
            </p>
          </div>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Schedule an Appointment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(appointment => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onReschedule={apt => setRescheduleTarget(apt)}
              onCancel={apt => setCancelTarget(apt)}
            />
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        appointment={rescheduleTarget}
        onSuccess={fetchAppointments}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        appointment={cancelTarget}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};
