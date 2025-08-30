import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';
import { Navigate } from 'react-router-dom';

interface EduShopeeRouteGuardProps {
  children: React.ReactNode;
}

const EduShopeeRouteGuard: React.FC<EduShopeeRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  const allowedRoles = ['admin', 'học việc/thử việc'];

  if (userProfile && allowedRoles.includes(userProfile.role)) {
    return <>{children}</>;
  }

  // Redirect other users to the home page
  return <Navigate to="/" replace />;
};

export default EduShopeeRouteGuard;