
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, MessageCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: userProfile } = useUserProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-red-600">
              BETACOM
            </h1>
            
            <nav className="flex space-x-6">
              <button
                onClick={() => navigate('/banners')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Banner
              </button>
              
              <button
                onClick={() => navigate('/chatbot')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 inline-block mr-1" />
                Tư vấn AI
              </button>
              
              <button
                onClick={() => navigate('/seo-chatbot')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-green-600 transition-colors flex items-center"
              >
                <Search className="w-4 h-4 inline-block mr-1" />
                SEO Shopee
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 inline-block mr-1" />
                  Quản lý Admin
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">
                {userProfile?.full_name || 'User'}
              </div>
              <div className="text-gray-500">
                {userProfile?.role} {userProfile?.team && `• ${userProfile.team}`}
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
