import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledgePage from '@/pages/SeoKnowledgePage';
// Removed import ProductCategoryManagement from '@/components/admin/ProductCategoryManagement';
import TeamManagement from '@/pages/admin/TeamManagement';
import MyProfilePage from '@/pages/MyProfilePage';

interface ManagementContentProps {
  activeTab: string;
}

const ManagementContent: React.FC<ManagementContentProps> = ({ activeTab }) => {
  const { data: userProfile } = useUserProfile();
  
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

  // Chuyen vien can only see My Profile
  if (isChuyenVien) {
    return <MyProfilePage />;
  }

  switch (activeTab) {
    case 'users':
      return (isAdmin || isLeader) ? <UserManagement /> : null;
    case 'my-profile':
      return <MyProfilePage />;
    case 'teams':
      return isAdmin ? <TeamManagement /> : null;
    // Removed case 'product-categories':
    //   return isAdmin ? <ProductCategoryManagement /> : null;
    case 'knowledge':
      return isAdmin ? <KnowledgeBase /> : null;
    case 'seo-knowledge':
      return isAdmin ? <SeoKnowledgePage /> : null;
    default:
      // Fallback for when activeTab is not set or invalid for the role
      if (isAdmin) return <MyProfilePage />; // Admin default to My Profile
      if (isLeader) return <UserManagement />; // Leader default to User Management
      return <MyProfilePage />; // Fallback for other roles
  }
};

export default ManagementContent;