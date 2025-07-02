import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, MessageCircle, Search, Menu, X, HelpCircle, ChevronDown, Package, LayoutGrid } from 'lucide-react'; // Added LayoutGrid
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    { path: '/banners', label: 'Thumbnail', icon: LayoutGrid }, // Changed to Thumbnail with LayoutGrid icon
    { path: '/quick-post', label: 'Đăng nhanh SP', icon: Package },
    // CHAT AI group for desktop
    { 
      id: 'chat-ai-group', 
      label: 'CHAT AI', 
      icon: MessageCircle, 
      subItems: [
        { path: '/chatbot', label: 'Tư vấn AI', icon: MessageCircle },
        { path: '/seo-chatbot', label: 'SEO Shopee', icon: Search },
        { path: '/general-chatbot', label: 'Hỏi đáp chung', icon: HelpCircle },
      ]
    },
    ...(isAdmin || isLeader ? [{ path: '/admin', label: 'Quản lý Admin', icon: Settings }] : []),
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8 cursor-pointer" onClick={() => navigate('/')}> {/* Added onClick to navigate to home */}
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Betacom Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              item.subItems ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-primary transition-colors flex items-center whitespace-nowrap"
                    >
                      {item.icon && <item.icon className="w-4 h-4 inline-block mr-1" />}
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.subItems.map(subItem => (
                      <DropdownMenuItem 
                        key={subItem.path} 
                        onClick={() => navigate(subItem.path)} 
                        className="py-2 flex items-center" // Added flex items-center for alignment
                      >
                        <subItem.icon className="w-4 h-4 mr-3" />
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-primary transition-colors flex items-center whitespace-nowrap"
                >
                  {item.icon && <item.icon className="w-4 h-4 inline-block mr-1" />}
                  {item.label}
                </button>
              )
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
                  <SheetTitle className="text-xl font-bold text-primary">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 space-y-2">
                  {navItems.map(item => (
                    item.subItems ? (
                      // For mobile, list sub-items directly
                      <React.Fragment key={item.id}>
                        <div className="text-sm font-semibold text-gray-700 px-3 py-2 mt-2">
                          {item.label}
                        </div>
                        {item.subItems.map(subItem => (
                          <Button
                            key={subItem.path}
                            variant="ghost"
                            onClick={() => {
                              navigate(subItem.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className="justify-start text-base py-2 px-3 pl-6" // Indent sub-items
                          >
                            {subItem.icon && <subItem.icon className="w-5 h-5 mr-3" />} {/* Increased right margin */}
                            {subItem.label}
                          </Button>
                        ))}
                      </React.Fragment>
                    ) : (
                      <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start text-base py-2 px-3"
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />} {/* Increased right margin */}
                        {item.label}
                      </Button>
                    )
                  ))}
                  <Button 
                    onClick={handleSignOut}
                    variant="ghost"
                    className="justify-start text-destructive hover:text-destructive/90 py-2 px-3 mt-4"
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
            className="text-destructive hover:text-destructive/90 hidden md:flex"
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