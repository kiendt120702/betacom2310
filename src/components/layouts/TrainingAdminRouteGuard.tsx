import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from '@/components/PageLoader';
import { Navigate } from 'react-router-dom';

interface TrainingAdminRouteGuardProps {
  children: React.ReactNode;
}

const TrainingAdminRouteGuard: React.FC<TrainingAdminRouteGuardProps> = ({ children }) => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return <PageLoader />;
  }

  const isAdmin = userProfile?.role === 'admin';
  const isTrainingDepartmentHead = userProfile?.role === 'trưởng phòng' && userProfile.teams?.name === 'Phòng Đào Tạo';

  if (isAdmin || isTrainingDepartmentHead) {
    return <>{children}</>;
  }

  // Redirect non-authorized users to the home page
  return <Navigate to="/" replace />;
};

export default TrainingAdminRouteGuard;