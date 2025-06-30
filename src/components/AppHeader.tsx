import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, MessageCircle, Search, Menu, X, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';

  const navItems = [
    { path: '/banners', label: 'Banner', icon: null },
    { path: '/chatbot', label: 'Tư vấn AI', icon: MessageCircle },
    { path: '/seo-chatbot', label: 'SEO Shopee', icon: Search },
    { path: '/general-chatbot', label: 'Hỏi đáp chung', icon: HelpCircle },
    ...(isAdmin || isLeader ? [{ path: '/admin', label: 'Quản lý Admin', icon: Settings }] : []),
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Betacom Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center whitespace-nowrap"
              >
                {item.icon && <item.icon className="w-4 h-4 inline-block mr-1" />}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {!isLoading && userProfile && (
            <div className="text-right text-sm hidden sm:block flex-shrink-0 min-w-0">
              <div className="font-medium text-gray-900 whitespace-nowrap truncate">
                {userProfile.full_name || 'User'}
              </div>
              <div className="text-gray-500 whitespace-nowrap truncate">
                {userProfile.role} {userProfile.team && `• ${userProfile.team}`}
              </div>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          {isMobile && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-xl font-bold text-red-600">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 space-y-2">
                  {navItems.map(item => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start text-base py-2 px-3"
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                      {item.label}
                    </Button>
                  ))}
                  <Button 
                    onClick={handleSignOut}
                    variant="ghost"
                    className="justify-start text-red-600 hover:text-red-700 py-2 px-3 mt-4"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Đăng xuất
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Logout Button */}
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="default"
            className="text-red-600 hover:text-red-700 hidden md:flex"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;