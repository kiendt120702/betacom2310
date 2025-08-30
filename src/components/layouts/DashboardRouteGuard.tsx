import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';
import { Navigate } from 'react-router-dom';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

const DashboardRouteGuard: React.FC<DashboardRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  // Chỉ admin và leader mới có thể truy cập dashboard
  if (userProfile?.role === 'admin' || userProfile?.role === 'leader') {
    return <>{children}</>;
  }

  // Chuyển hướng các vai trò khác về trang chủ
  return <Navigate to="/" replace />;
};

export default DashboardRouteGuard;