import React, { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { IAppointment } from '../../../../package/src/types/appointment';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: IAppointment | null;
  onSuccess: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!appointment) return null;

  const doctorName = typeof appointment.doctor === 'object'
    ? (appointment.doctor as any).name
    : 'Doctor';

  const handleConfirmCancel = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/appointments/${appointment._id}/cancel`, {
        reason: reason.trim() || 'Cancelled by patient',
      });

      success('Appointment successfully cancelled.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="leading-snug">
            Are you sure you want to cancel your scheduled appointment with <strong>{doctorName}</strong> on <strong>{appointment.date} at {appointment.time}</strong>?
          </p>
        </div>

        <p className="text-xs text-slate-500">
          This slot will be immediately released for other patients waiting in the queue. You can schedule a new appointment anytime.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Cancellation (Optional)
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 outline-hidden focus:bg-white focus:border-teal-500 mb-2"
          >
            <option value="">Select a reason...</option>
            <option value="Scheduling conflict">Scheduling conflict / Busy</option>
            <option value="Feeling better / Recovered">Feeling better / Recovered</option>
            <option value="Visited another clinic">Visited another clinic</option>
            <option value="Need to change doctor">Need to change specialist</option>
            <option value="Other personal reason">Other personal reason</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            Keep Appointment
          </button>
          <button
            id="confirm-cancel-appointment-btn"
            type="button"
            disabled={submitting}
            onClick={handleConfirmCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>{submitting ? 'Cancelling...' : 'Cancel Appointment'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
