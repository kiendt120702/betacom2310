import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ComingSoonPage from '@/pages/ComingSoonPage';
import PageLoader from '@/components/PageLoader';

interface EduRouteGuardProps {
  children: React.ReactNode;
}

const EduRouteGuard: React.FC<EduRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  if (userProfile?.role === 'admin') {
    return <>{children}</>;
  }

  return <ComingSoonPage />;
};

export default EduRouteGuard;