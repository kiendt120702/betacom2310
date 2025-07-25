import React from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { useManagementAuth } from '@/hooks/useManagementAuth';
import ManagementLayout from '@/components/management/ManagementLayout';
import ManagementContent from '@/components/management/ManagementContent';

const Management = () => {
  const { user: userProfile, isLoading } = useManagementAuth(); // Destructure 'user' as 'userProfile'
  const location = useLocation(); // Get location object
  const activeTab = location.hash.replace('#', ''); // Derive activeTab from URL hash

  if (isLoading) {
    return (
      <ManagementLayout>
        <div>Loading...</div>
      </ManagementLayout>
    );
  }

  if (!userProfile) return null;

  return (
    <ManagementLayout>
      <ManagementContent activeTab={activeTab} />
    </ManagementLayout>
  );
};

export default Management;