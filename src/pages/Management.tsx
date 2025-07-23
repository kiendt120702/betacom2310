import React from 'react';
import { useManagementAuth } from '@/hooks/useManagementAuth';
import ManagementLayout from '@/components/management/ManagementLayout';
import ManagementContent from '@/components/management/ManagementContent';
import SeoKnowledgePage from './SeoKnowledgePage';
import TeamManagement from './admin/TeamManagement';
import UserManagement from '@/components/admin/UserManagement';
import MyProfilePage from './MyProfilePage';
import CustomStrategyPage from './CustomStrategyPage';
import { useLocation } from 'react-router-dom';
import KnowledgeBase from '@/components/admin/KnowledgeBase'; // Đã sửa đường dẫn import

const Management: React.FC = () => {
  const { userProfile, isLoading, activeTab } = useManagementAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <ManagementLayout>
        <div>Loading...</div>
      </ManagementLayout>
    );
  }

  if (!userProfile) return null;

  const managementComponents = {
    'users': <UserManagement />,
    'teams': <TeamManagement />,
    'knowledge': <KnowledgeBase />,
    'seo-knowledge': <SeoKnowledgePage />,
    'my-profile': <MyProfilePage />,
    'shopee-strategies': <CustomStrategyPage />,
  };

  const activeComponent = managementComponents[activeTab] || <MyProfilePage />;

  return (
    <ManagementLayout>
      <ManagementContent activeTab={activeTab} />
      {activeComponent}
    </ManagementLayout>
  );
};

export default Management;