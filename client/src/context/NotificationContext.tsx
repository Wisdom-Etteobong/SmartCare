import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { INotification, NotificationStats } from '../../../package/src/types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  activeToast: INotification | null;
  dismissToast: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<INotification | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notifications');
      if (res.data?.success && res.data?.data) {
        const list: INotification[] = res.data.data.notifications || [];
        const stats: NotificationStats = res.data.data.stats || { total: 0, unread: 0, byType: {} as any };

        // Detect new unread notification for toast popups
        if (!initialLoadRef.current) {
          const freshNew = list.find(n => !n.isRead && !knownIdsRef.current.has(n._id));
          if (freshNew) {
            setActiveToast(freshNew);
            // Auto dismiss toast after 6 seconds
            setTimeout(() => {
              setActiveToast(current => (current?._id === freshNew._id ? null : current));
            }, 6000);
          }
        }

        // Update known IDs
        list.forEach(n => knownIdsRef.current.add(n._id));
        initialLoadRef.current = false;

        setNotifications(list);
        setUnreadCount(stats.unreadCount ?? list.filter(n => !n.isRead).length);
      }
    } catch {
      // ignore transient network/auth glitches
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));

      // Polling every 12 seconds for real-time notification alerts
      const interval = setInterval(() => {
        fetchNotifications();
      }, 12000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      initialLoadRef.current = true;
      knownIdsRef.current.clear();
    }
  }, [isAuthenticated, fetchNotifications, user?._id]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // rollback or retry
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const item = prev.find(n => n._id === id);
        if (item && !item.isRead) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== id);
      });
    } catch {
      // ignore
    }
  };

  const dismissToast = () => setActiveToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        activeToast,
        dismissToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
