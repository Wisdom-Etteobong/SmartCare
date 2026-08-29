import React from 'react';
import { CheckCircle2, Clock, XCircle, Check } from 'lucide-react';
import { AppointmentStatus } from '../../../../package/src/types/appointment';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    Confirmed: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    },
    Pending: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: Clock,
      dot: 'bg-amber-500',
    },
    Completed: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: Check,
      dot: 'bg-blue-500',
    },
    Cancelled: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: XCircle,
      dot: 'bg-rose-500',
    },
  };

  const current = configs[status] || configs.Pending;
  const Icon = current.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClass} font-medium tracking-wide shadow-xs`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
