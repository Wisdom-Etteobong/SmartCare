import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Info,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { INotification } from '../../../../package/src/types/notification';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'appointment_transferred':
        return <ArrowRightLeft className="w-4 h-4 text-purple-600" />;
      case 'appointment_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'appointment_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'login_alert':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = (item: INotification) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
    if (item.actionUrl) {
      setIsOpen(false);
      navigate(item.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        id="notification-bell-btn"
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 px-4 pt-2 gap-4 text-xs font-medium text-slate-500">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 transition cursor-pointer ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-2 transition cursor-pointer ${
                activeTab === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No {activeTab === 'unread' ? 'unread' : ''} notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up with your updates.</p>
              </div>
            ) : (
              filteredNotifications.map(item => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 relative group ${
                    !item.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {!item.isRead && (
                    <div className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}

                  <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-baseline justify-between gap-1">
                      <h4 className={`text-xs ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'} truncate`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {item.actionUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-1">
                        View <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 rounded-lg p-0.5 transition">
                    {!item.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item._id);
                        }}
                        title="Mark as read"
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item._id);
                      }}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
