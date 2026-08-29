import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  ChevronRight,
  RefreshCw,
  XCircle,
  FileText,
} from 'lucide-react';
import { IAppointment } from '../../../../package/src/types/appointment';
import { StatusBadge } from '../common/StatusBadge';

interface AppointmentCardProps {
  appointment: IAppointment;
  onReschedule?: (appointment: IAppointment) => void;
  onCancel?: (appointment: IAppointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onReschedule,
  onCancel,
}) => {
  const doctor = typeof appointment.doctor === 'object' ? (appointment.doctor as any) : null;
  const doctorName = doctor?.name || 'Doctor';
  const doctorSpecialty = doctor?.specialty || 'Specialist';
  const doctorImage =
    doctor?.profileImage ||
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
  const doctorDepartment = doctor?.department || 'Outpatient Clinic';

  const canModify = appointment.status === 'Confirmed' || appointment.status === 'Pending';

  return (
    <div
      id={`appointment-card-${appointment._id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Specialty, Status & Reference */}
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100 mb-4">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            {doctorSpecialty}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} size="sm" />
          </div>
        </div>

        {/* Doctor & Date Details */}
        <div className="flex items-start gap-4">
          <img
            src={doctorImage}
            alt={doctorName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">{doctorName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctorDepartment}</span>
            </p>

            {/* Date & Time pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/60">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{appointment.date}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reason for visit */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              <strong className="text-slate-700 font-semibold">Reason:</strong> {appointment.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/appointments/${appointment._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {canModify && (
          <div className="flex items-center gap-1.5">
            {onReschedule && (
              <button
                type="button"
                onClick={() => onReschedule(appointment)}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reschedule</span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={() => onCancel(appointment)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors"
                title="Cancel Appointment"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
