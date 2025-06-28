
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

const Admin = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('adminActiveTab') || 'users';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && !['admin', 'leader'].includes(userProfile.role)) {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang quản lý.",
        variant: "destructive",
      });
      navigate('/banners');
      return;
    }
  }, [user, userProfile, navigate, toast]);

  if (!user || !userProfile || !['admin', 'leader'].includes(userProfile.role)) return null;

  const isAdmin = userProfile.role === 'admin';
  const isLeader = userProfile.role === 'leader';

  const menuItems = [
    { id: 'users', label: 'Quản lý User', icon: Users, available: true },
    { id: 'knowledge', label: 'Knowledge Base', icon: Brain, available: isAdmin },
    { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search, available: isAdmin },
    { id: 'settings', label: 'Cài đặt', icon: Settings, available: isAdmin }
  ].filter(item => item.available);

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'knowledge':
        return isAdmin ? <KnowledgeBase /> : null;
      case 'seo-knowledge':
        return isAdmin ? <SeoKnowledgeManager /> : null;
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
        ) : null;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="flex">
        <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-red-600">
                  {isAdmin ? 'Admin Panel' : 'Team Management'}
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
