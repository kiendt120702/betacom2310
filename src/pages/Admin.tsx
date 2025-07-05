import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Menu,
  X,
  Brain,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart2,
  Users2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledgePage from '@/pages/SeoKnowledgePage';
import AppHeader from '@/components/AppHeader';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductCategoryManagement from '@/components/admin/ProductCategoryManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';
import TeamManagement from '@/pages/admin/TeamManagement';

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [redirectInitiated, setRedirectInitiated] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (redirectInitiated) return;

    if (!user) {
      setRedirectInitiated(true);
      navigate('/auth');
      return;
    }
    
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang quản lý admin.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      // Đổi hướng về thumbnail
      navigate('/thumbnail');
      return;
    }
  }, [user, userProfile, navigate, toast, redirectInitiated]);

  const handleLogout = async () => {
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
    navigate('/auth');
  };

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

  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'leader')) return null;

  const isAdmin = userProfile.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Thống kê', icon: BarChart2 },
    { id: 'users', label: 'Quản lý User', icon: Users },
    ...(isAdmin ? [
      { id: 'teams', label: 'Quản lý Team', icon: Users2 },
      { id: 'product-categories', label: 'Quản lý Ngành hàng', icon: Package },
      { id: 'knowledge', label: 'Knowledge Base', icon: Brain },
      { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search },
      { id: 'settings', label: 'Cài đặt', icon: Settings }
    ] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'teams':
        return isAdmin ? <TeamManagement /> : <UserManagement />;
      case 'product-categories':
        return isAdmin ? <ProductCategoryManagement /> : <UserManagement />;
      case 'knowledge':
        return isAdmin ? <KnowledgeBase /> : <UserManagement />;
      case 'seo-knowledge':
        return isAdmin ? <SeoKnowledgePage /> : <UserManagement />;
      case 'settings':
        return isAdmin ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Cài đặt</h2>
              <p className="text-gray-600 mt-2">Cấu hình hệ thống</p>
            </div>
            <div className="text-center py-12 text-gray-500">
              Chức năng cài đặt sẽ được phát triển sau
            </div>
          </div>
        ) : <UserManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      {/* ... rest unchanged */}
    </div>
  );
};

export default Admin;