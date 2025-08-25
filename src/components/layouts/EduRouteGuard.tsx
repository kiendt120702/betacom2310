import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';

interface EduRouteGuardProps {
  children: React.ReactNode;
}

const EduRouteGuard: React.FC<EduRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  // Cho phép tất cả người dùng đã xác thực truy cập các trang EDU.
  // Route đã được bảo vệ bởi ProtectedRoute, vì vậy chúng ta chỉ cần render children.
  return <>{children}</>;
};

export default EduRouteGuard;