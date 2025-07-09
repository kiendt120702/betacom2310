
import React from 'react';
import { useManagementAuth } from '@/hooks/useManagementAuth';
import ManagementLayout from '@/components/management/ManagementLayout';
import ManagementContent from '@/components/management/ManagementContent';

const Management = () => {
  const { userProfile, isLoading, activeTab } = useManagementAuth();

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
