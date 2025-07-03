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
  BarChart2 // Added for Dashboard icon
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
import DashboardOverview from '@/components/admin/DashboardOverview'; // Import the new Dashboard component

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('adminActiveTab') || 'dashboard'; // Default to dashboard
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [redirectInitiated, setRedirectInitiated] = useState(false); // New state to prevent infinite loop

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (redirectInitiated) return; // If a redirect has already been initiated, do nothing

    // ProtectedRoute now handles the !user check, so we only need to check userProfile roles here.
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang quản lý admin.",
        variant: "destructive",
      });
      setRedirectInitiated(true); // Mark redirect as initiated
      navigate('/banners');
      return;
    }
  }, [userProfile, navigate, toast, redirectInitiated]); // Removed 'user' from dependencies as ProtectedRoute handles it

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

  // This check is still necessary for initial render before ProtectedRoute fully takes over,
  // or if user/userProfile somehow becomes null after initial load (e.g., session expires).
  // ProtectedRoute handles the primary redirect.
  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'leader')) return null;

  const isAdmin = userProfile.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Thống kê', icon: BarChart2 }, // New Dashboard item
    { id: 'users', label: 'Quản lý User', icon: Users },
    ...(isAdmin ? [
      { id: 'product-categories', label: 'Quản lý Ngành hàng', icon: Package },
      { id: 'knowledge', label: 'Knowledge Base', icon: Brain },
      { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search },
      { id: 'settings', label: 'Cài đặt', icon: Settings }
    ] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />; // Render the new Dashboard component
      case 'users':
        return <UserManagement />;
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
        return <DashboardOverview />; // Default to dashboard
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar - Improved Design */}
        <div className={`hidden md:flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 border-r border-gray-200`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-[64px]">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Admin Panel
                </h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className={`flex-shrink-0 ${activeTab === item.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <item.icon size={20} />
                </div>
                {sidebarOpen && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
                {!sidebarOpen && activeTab === item.id && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {userProfile.full_name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{userProfile.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile.role} {userProfile.team && `• ${userProfile.team}`}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 border-b border-gray-100">
                <SheetTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-2">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="justify-start text-base py-3 px-4 h-auto"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;