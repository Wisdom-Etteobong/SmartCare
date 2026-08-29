import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from './AppLayout';
import { PublicLayout } from './PublicLayout';

/**
 * AdaptiveLayout:
 * Renders the persistent Authenticated AppLayout (Sidebar, Authenticated Header, Notifications, User Profile)
 * when a patient, doctor, or admin is logged in, and the PublicLayout (Header & Footer) for guests.
 * This guarantees that browsing doctors or specialists never kicks logged-in users out of their portal context.
 */
export const AdaptiveLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AppLayout />;
  }

  return <PublicLayout />;
};

export default AdaptiveLayout;
