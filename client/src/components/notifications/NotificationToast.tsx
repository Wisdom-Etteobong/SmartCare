import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Calendar, ArrowRightLeft, CheckCircle2, AlertTriangle, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'appointment_booked':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'appointment_transferred':
        return <ArrowRightLeft className="w-5 h-5 text-purple-600" />;
      case 'appointment_completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'appointment_cancelled':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleClick = () => {
    markAsRead(activeToast._id);
    dismissToast();
    if (activeToast.actionUrl) {
      navigate(activeToast.actionUrl);
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 transition-all duration-300 transform translate-y-0 animate-bounce-short">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              New In-App Alert
            </span>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          {activeToast.actionUrl && (
            <button
              onClick={handleClick}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group cursor-pointer"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
