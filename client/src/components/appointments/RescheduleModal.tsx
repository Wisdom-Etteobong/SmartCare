import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { IAppointment } from '../../../../package/src/types/appointment';
import { DoctorAvailabilityResponse, DoctorSlot } from '../../../../package/src/types/doctor';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: IAppointment | null;
  onSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availability, setAvailability] = useState<DoctorAvailabilityResponse | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Initialize date when modal opens
  useEffect(() => {
    if (appointment) {
      // Default to next day or current appointment date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];
      setSelectedDate(appointment.date >= defaultDate ? appointment.date : defaultDate);
      setSelectedTime(appointment.time);
      setReason(appointment.reason || '');
    }
  }, [appointment, isOpen]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!appointment || !selectedDate) return;

    const doctorId = typeof appointment.doctor === 'object'
      ? (appointment.doctor as any)._id
      : appointment.doctor;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get(`/doctors/${doctorId}/availability?date=${selectedDate}`);
        setAvailability(res.data.data);
      } catch (err: any) {
        error(err.message || 'Failed to load doctor schedule for this date');
        setAvailability(null);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [appointment, selectedDate, error]);

  if (!appointment) return null;

  const doctorName = typeof appointment.doctor === 'object'
    ? (appointment.doctor as any).name
    : 'Doctor';

  const doctorSpecialty = typeof appointment.doctor === 'object'
    ? (appointment.doctor as any).specialty
    : '';

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      error('Please select both a new date and an available time slot');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/appointments/${appointment._id}`, {
        date: selectedDate,
        time: selectedTime,
        reason,
      });

      success('Appointment successfully rescheduled!');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Doctor banner */}
        <div className="p-3.5 bg-teal-50 border border-teal-200/70 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {doctorSpecialty}
            </p>
            <p className="text-sm font-extrabold text-slate-800">{doctorName}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span className="block font-medium">Current Slot:</span>
            <span className="font-bold text-slate-700">{appointment.date} at {appointment.time}</span>
          </div>
        </div>

        {/* Step 1: Select New Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select New Date
          </label>
          <input
            id="reschedule-date-input"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setSelectedTime('');
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-800 outline-hidden"
            required
          />
        </div>

        {/* Step 2: Available Time Slots */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Choose Available Time Slot
          </label>

          {loadingSlots ? (
            <div className="py-6 bg-slate-50 rounded-xl border border-slate-200">
              <LoadingSpinner size="sm" message="Loading doctor availability..." />
            </div>
          ) : !availability?.isWorkingDay ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {doctorName} is not scheduled to work on {availability?.dayOfWeek || 'this day'}. Please select another date.
              </span>
            </div>
          ) : availability.slots.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border">
              No slots configured for this date.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {availability.slots.map(slot => {
                const isSelected = selectedTime === slot.time;
                const isSameAsCurrentSlot =
                  appointment.date === selectedDate && appointment.time === slot.time;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.isAvailable && !isSameAsCurrentSlot}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : isSameAsCurrentSlot
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : slot.isAvailable
                        ? 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Optional Reason Update */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Reason for Visit (Optional Update)
          </label>
          <textarea
            id="reschedule-reason-input"
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for appointment or specific concerns..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm text-slate-800 outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-reschedule-btn"
            type="submit"
            disabled={submitting || !selectedTime || !availability?.isWorkingDay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Updating...' : 'Confirm Reschedule'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
