
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserManagement from '@/components/admin/UserManagement';
import AppHeader from '@/components/AppHeader';

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Preserve current tab from URL or state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['users', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && userProfile.role !== 'admin') {
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin?tab=${tabId}`, { replace: true });
  };

  if (!user || !userProfile || userProfile.role !== 'admin') return null;

  const menuItems = [
    { id: 'users', label: 'Quản lý User', icon: Users },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Cài đặt</h2>
              <p className="text-gray-600 mt-2">Cấu hình hệ thống</p>
            </div>
            <div className="text-center py-12 text-gray-500">
              Chức năng cài đặt sẽ được phát triển sau
            </div>
          </div>
        );
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
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
                onClick={() => handleTabChange(item.id)}
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
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
