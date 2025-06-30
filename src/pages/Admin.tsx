import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Brain,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import KnowledgeBase from '@/components/admin/KnowledgeBase';
import SeoKnowledgeManager from '@/components/admin/SeoKnowledgeManager';
import AppHeader from '@/components/AppHeader';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('adminActiveTab') || 'users';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang quản lý admin.",
        variant: "destructive",
      });
      navigate('/banners');
      return;
    }
  }, [user, userProfile, navigate, toast]);

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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'leader')) return null;

  const isAdmin = userProfile.role === 'admin';

  const menuItems = [
    { id: 'users', label: 'Quản lý User', icon: Users },
    ...(isAdmin ? [
      { id: 'knowledge', label: 'Knowledge Base', icon: Brain },
      { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search },
      { id: 'settings', label: 'Cài đặt', icon: Settings }
    ] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'knowledge':
        return isAdmin ? <KnowledgeBase /> : <UserManagement />;
      case 'seo-knowledge':
        return isAdmin ? <SeoKnowledgeManager /> : <UserManagement />;
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
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className={`hidden md:flex bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-red-600">
                  Admin Panel
                </h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Sidebar (Sheet) */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-xl font-bold text-red-600">
                  Admin Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-2">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="justify-start text-base py-2 px-3"
                  >
                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex-1 overflow-auto p-4 sm:p-8"> {/* Adjusted padding for responsiveness */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;