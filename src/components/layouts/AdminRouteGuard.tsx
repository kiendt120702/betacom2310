import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';
import { Navigate } from 'react-router-dom';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  if (userProfile?.role === 'admin') {
    return <>{children}</>;
  }

  // Redirect non-admins to the home page
  return <Navigate to="/" replace />;
};

export default AdminRouteGuard;