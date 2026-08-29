import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  User,
  ArrowLeft,
  RefreshCw,
  XCircle,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRightLeft,
  Pill,
} from 'lucide-react';
import { api } from '../services/api';
import { IAppointment } from '../../../package/src/types/appointment';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RescheduleModal } from '../components/appointments/RescheduleModal';
import { CancelModal } from '../components/appointments/CancelModal';

export const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/${id}`);
      if (res.data?.data?.appointment) {
        setAppointment(res.data.data.appointment);
      }
    } catch (err: any) {
      console.error('Failed to load appointment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading appointment details..." />;
  }

  if (!appointment) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Appointment Record Not Found</h2>
        <p className="text-sm text-slate-500">
          This appointment may have been deleted, or you do not have permission to view it.
        </p>
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Appointments</span>
        </Link>
      </div>
    );
  }

  const doctor = typeof appointment.doctor === 'object' ? (appointment.doctor as any) : null;
  const transferredFromDoctor = typeof appointment.transferredFrom === 'object' ? (appointment.transferredFrom as any) : null;

  const canModify = appointment.status === 'Confirmed' || appointment.status === 'Pending';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Appointments</span>
        </Link>
      </div>

      {/* Main Appointment Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                REF: SC-{appointment._id.slice(-6).toUpperCase()}
              </span>
              <StatusBadge status={appointment.status} />
              {transferredFromDoctor && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3" />
                  Transferred Specialist
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Hospital Consultation Pass
            </h1>
            <p className="text-xs text-slate-400">
              Booked on {new Date(appointment.createdAt || '').toLocaleDateString()}
            </p>
          </div>

          {/* Top Actions */}
          {canModify && (
            <div className="flex items-center gap-2">
              <button
                id="details-reschedule-btn"
                type="button"
                onClick={() => setRescheduleOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>

              <button
                id="details-cancel-btn"
                type="button"
                onClick={() => setCancelOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Transfer Notice if applicable */}
        {transferredFromDoctor && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-800">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Specialist Transfer Notice</span>
            </div>
            <p className="leading-relaxed">
              This appointment was transferred to <strong className="font-bold">{doctor?.name}</strong> by{' '}
              <strong className="font-bold">{transferredFromDoctor?.name}</strong> ({transferredFromDoctor?.specialty}).
            </p>
            {appointment.transferReason && (
              <p className="text-purple-700 font-medium">
                Clinical Reason: "{appointment.transferReason}"
              </p>
            )}
          </div>
        )}

        {/* Doctor Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="md:col-span-8 flex items-start gap-4">
            <img
              src={
                doctor?.profileImage ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
              }
              alt={doctor?.name || 'Doctor'}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                {doctor?.specialty}
              </span>
              <h3 className="text-lg font-bold text-slate-900 truncate">
                {doctor?.name || 'Assigned Specialist'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{doctor?.department || 'Outpatient Clinic'}</span>
              </p>
              {doctor?.qualifications && (
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {doctor.qualifications.join(' • ')}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Structure</span>
            <p className="text-xl font-extrabold text-slate-900">
              ${doctor?.consultationFee || 50}
              <span className="text-xs font-normal text-slate-400"> / visit</span>
            </p>
            <p className="text-[11px] text-teal-700 font-semibold">Covered by Hospital Registration</p>
          </div>
        </div>

        {/* Schedule & Timing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/70 space-y-1">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              Appointment Date
            </span>
            <p className="text-base font-extrabold text-slate-900">{appointment.date}</p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/70 space-y-1">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Reserved Slot
            </span>
            <p className="text-base font-extrabold text-slate-900">{appointment.time}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Consultation Mode
            </span>
            <p className="text-base font-extrabold text-slate-900">
              {appointment.type || 'In-Person Consultation'}
            </p>
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Reason for Consultation
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 font-medium leading-relaxed">
            {appointment.reason}
          </div>
        </div>

        {/* Clinical Results & Prescription when completed */}
        {(appointment.diagnosis || appointment.prescription || appointment.doctorNotes) && (
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Doctor Consultation Findings & Prescription</span>
            </div>

            {appointment.diagnosis && (
              <div className="text-xs">
                <span className="font-bold text-slate-800">Diagnosis: </span>
                <span className="text-slate-700 font-medium">{appointment.diagnosis}</span>
              </div>
            )}

            {appointment.prescription && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200/80 text-xs flex items-start gap-2.5 text-slate-800">
                <Pill className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-emerald-900 block mb-0.5">Prescribed Medications:</strong>
                  <span>{appointment.prescription}</span>
                </div>
              </div>
            )}

            {appointment.doctorNotes && (
              <div className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-emerald-100">
                <strong className="font-bold text-slate-700 block mb-1">Doctor Advice:</strong>
                <p className="whitespace-pre-line">{appointment.doctorNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Reason if cancelled */}
        {appointment.status === 'Cancelled' && appointment.cancellationReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-1">
            <span className="font-bold flex items-center gap-1 text-rose-700">
              <XCircle className="w-4 h-4 text-rose-600" />
              Appointment Was Cancelled
            </span>
            <p className="text-rose-800">Reason: {appointment.cancellationReason}</p>
          </div>
        )}

        {/* Hospital Arrival Guidance */}
        <div className="p-5 rounded-2xl bg-teal-600 text-white space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-200" />
            <h4 className="font-bold text-sm">Express Hospital Check-In Instructions</h4>
          </div>
          <p className="text-xs text-teal-50 leading-relaxed">
            Present your pass reference (<strong>SC-{appointment._id.slice(-6).toUpperCase()}</strong>) at the reception desk in {doctor?.department || 'Outpatient Clinic'}. Because your slot is reserved via SmartCare, you will bypass the standard queue.
          </p>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        appointment={appointment}
        onSuccess={fetchAppointment}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        appointment={appointment}
        onSuccess={fetchAppointment}
      />
    </div>
  );
};

export default AppointmentDetailsPage;
