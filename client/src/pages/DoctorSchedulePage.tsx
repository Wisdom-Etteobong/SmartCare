import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Info,
  Coffee,
  Sparkles,
  Building,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DayOfWeek, IDoctor } from '../../../package/src/types/doctor';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const ALL_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DoctorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable availability schedule
  const [scheduleState, setScheduleState] = useState<
    Array<{
      day: DayOfWeek;
      isWorking: boolean;
      startTime: string;
      endTime: string;
      breakStartTime: string;
      breakEndTime: string;
      slotDurationMinutes: number;
    }>
  >([]);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      const docId = user?.doctorId || (user?.doctorProfile as any)?._id;
      if (!docId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/doctors/${docId}`);
        const doc: IDoctor = res.data?.data?.doctor;
        setDoctor(doc);

        // Build 7-day schedule map
        const mapped = ALL_DAYS.map(day => {
          const found = doc.availability?.find(a => a.day === day);
          return {
            day,
            isWorking: !!found,
            startTime: found?.startTime || '09:00',
            endTime: found?.endTime || '17:00',
            breakStartTime: found?.breakStartTime || '13:00',
            breakEndTime: found?.breakEndTime || '14:00',
            slotDurationMinutes: found?.slotDurationMinutes || 30,
          };
        });

        setScheduleState(mapped);
      } catch (err: any) {
        error(err.message || 'Failed to load doctor schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user, error]);

  const handleToggleDay = (day: DayOfWeek) => {
    setScheduleState(prev =>
      prev.map(item => (item.day === day ? { ...item, isWorking: !item.isWorking } : item))
    );
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: 'startTime' | 'endTime' | 'breakStartTime' | 'breakEndTime' | 'slotDurationMinutes',
    value: any
  ) => {
    setScheduleState(prev =>
      prev.map(item => (item.day === day ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSchedule = async () => {
    if (!doctor) return;

    setSaving(true);
    try {
      // Filter only working days
      const updatedAvailability = scheduleState
        .filter(s => s.isWorking)
        .map(s => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          breakStartTime: s.breakStartTime || undefined,
          breakEndTime: s.breakEndTime || undefined,
          slotDurationMinutes: Number(s.slotDurationMinutes) || 30,
        }));

      const res = await api.patch(`/doctors/${doctor._id}`, {
        availability: updatedAvailability,
      });

      setDoctor(res.data?.data?.doctor);
      success('Working hours and consultation availability updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to save schedule changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner message="Loading practitioner schedule..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Consultation Hours & Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure your active working days, clinical consultation slots, and recess intervals.
          </p>
        </div>

        <button
          id="btn-save-schedule"
          onClick={handleSaveSchedule}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Save Schedule Settings'}</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/70 flex items-start gap-3 text-xs text-teal-900">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Real-time Slot Generation: </span>
          <span>
            Patients booking appointments through SmartCare will instantly see time slots generated according to your configured working hours and break periods. Existing booked slots are automatically protected against double-booking.
          </span>
        </div>
      </div>

      {/* Day by Day Schedule Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        {scheduleState.map(item => (
          <div
            key={item.day}
            className={`p-5 sm:p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              item.isWorking ? 'bg-white' : 'bg-slate-50/50 opacity-75'
            }`}
          >
            {/* Day Toggle */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isWorking}
                  onChange={() => handleToggleDay(item.day)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
              <div>
                <span className="text-sm font-bold text-slate-900 block">{item.day}</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.isWorking ? 'Active Consultation Day' : 'Day Off / Closed'}
                </span>
              </div>
            </div>

            {/* Time Controls */}
            {item.isWorking ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Shift Start
                  </label>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={e => handleTimeChange(item.day, 'startTime', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Shift End
                  </label>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={e => handleTimeChange(item.day, 'endTime', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Recess / Break
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={item.breakStartTime}
                      onChange={e => handleTimeChange(item.day, 'breakStartTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="time"
                      value={item.breakEndTime}
                      onChange={e => handleTimeChange(item.day, 'breakEndTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Slot Interval
                  </label>
                  <select
                    value={item.slotDurationMinutes}
                    onChange={e =>
                      handleTimeChange(item.day, 'slotDurationMinutes', Number(e.target.value))
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium italic">
                Doctor is unavailable for bookings on {item.day}s
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
