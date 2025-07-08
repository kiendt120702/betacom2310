import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Menu,
  Brain,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart2,
  Users2, // Added for Teams icon
  User, // Added for My Profile icon
  LucideIcon // Import LucideIcon type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledgePage from '@/pages/SeoKnowledgePage';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductCategoryManagement from '@/components/admin/ProductCategoryManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';
import TeamManagement from '@/pages/admin/TeamManagement';
import MyProfilePage from '@/pages/MyProfilePage';
import GeneralDashboard from './GeneralDashboard'; // Import the new GeneralDashboard

const Management = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading, isError, error } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location to read hash
  const { toast } = useToast();
  const [redirectInitiated, setRedirectInitiated] = useState(false);

  // Active tab is now derived from URL hash
  const activeTab = location.hash.replace('#', '');

  useEffect(() => {
    if (redirectInitiated) return;

    if (!user) {
      setRedirectInitiated(true);
      navigate('/auth');
      return;
    }
    
    if (isError) {
      console.error("Error loading user profile in Management page:", error);
      toast({
        title: "Lỗi tải hồ sơ",
        description: "Không thể tải thông tin hồ sơ người dùng. Vui lòng thử lại.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/auth');
      return;
    }

    // Determine initial tab based on user role if no hash is present
    if (!activeTab && userProfile) {
      const isAdmin = userProfile.role === 'admin';
      const isLeader = userProfile.role === 'leader';
      const isChuyenVien = userProfile.role === 'chuyên viên';

      let defaultTab = 'my-profile'; // Default for chuyen vien
      if (isAdmin) defaultTab = 'general-dashboard'; // Admin defaults to General Dashboard
      else if (isLeader) defaultTab = 'users'; // Leader defaults to User Management
      
      navigate(`/management#${defaultTab}`, { replace: true });
      return;
    }

    // Redirect if user doesn't have access to Management page at all
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader' && userProfile.role !== 'chuyên viên') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang management.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/thumbnail');
      return;
    }

    // Redirect if chuyen vien tries to access other tabs
    if (userProfile?.role === 'chuyên viên' && activeTab !== 'my-profile' && activeTab !== 'general-dashboard') { // Allow chuyen vien to see general-dashboard
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn chỉ có quyền truy cập hồ sơ của mình và tổng quan.",
        variant: "destructive",
      });
      navigate('/management#my-profile', { replace: true });
    }

  }, [user, userProfile, navigate, toast, redirectInitiated, activeTab, isError, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  const isAdmin = userProfile.role === 'admin';
  const isLeader = userProfile.role === 'leader';
  const isChuyenVien = userProfile.role === 'chuyên viên';

  const renderContent = () => {
    // Chuyen vien can only see General Dashboard and My Profile
    if (isChuyenVien) {
      if (activeTab === 'general-dashboard') return <GeneralDashboard />;
      return <MyProfilePage />; // Default for chuyen vien
    }

    switch (activeTab) {
      case 'general-dashboard':
        return <GeneralDashboard />;
      case 'dashboard':
        return isAdmin ? <DashboardOverview /> : null;
      case 'users':
        return (isAdmin || isLeader) ? <UserManagement /> : null;
      case 'my-profile':
        return <MyProfilePage />;
      case 'teams':
        return isAdmin ? <TeamManagement /> : null;
      case 'product-categories':
        return isAdmin ? <ProductCategoryManagement /> : null;
      case 'knowledge':
        return isAdmin ? <KnowledgeBase /> : null;
      case 'seo-knowledge':
        return isAdmin ? <SeoKnowledgePage /> : null;
      default:
        // Fallback for when activeTab is not set or invalid for the role
        if (isAdmin) return <GeneralDashboard />; // Admin default to General Dashboard
        if (isLeader) return <UserManagement />; // Leader default to User Management
        return <MyProfilePage />; // Fallback for other roles (shouldn't happen if initial redirect works)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Management;