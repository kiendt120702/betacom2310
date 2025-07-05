import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, MessageCircle, Search, Menu, X, HelpCircle, ChevronDown, Package, LayoutGrid, LucideIcon, User } from 'lucide-react'; // Added User icon
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

interface NavItem {
  path?: string;
  label: string;
  icon?: LucideIcon;
  id?: string; // Optional ID for group items
  subItems?: NavItem[]; // Optional sub-items for dropdowns
}

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
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

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { path: '/thumbnail', label: 'Thumbnail', icon: LayoutGrid },
    ];

    if (user) { // If logged in
      items.push(
        { path: '/quick-post', label: 'Đăng nhanh SP', icon: Package },
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
      );
      if (isAdmin || isLeader) {
        items.push({ 
          id: 'admin-group', 
          label: 'Quản lý Admin', 
          icon: Settings,
          path: '/admin', // Keep path for direct access to admin panel
          subItems: [
            { path: '/admin#my-profile', label: 'Hồ sơ của tôi', icon: User }, // Moved here
            { path: '/admin', label: 'Tổng quan', icon: Settings }, // Link to default admin tab
          ]
        });
      } else {
        // For 'chuyên viên' role, still show My Profile
        items.push({ path: '/my-profile', label: 'Hồ sơ của tôi', icon: User });
      }
    }
    return items;
  }, [user, isAdmin, isLeader]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8 cursor-pointer" onClick={() => navigate('/')}>
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
                        onClick={() => subItem.path && navigate(subItem.path)} 
                        className="py-2 flex items-center"
                      >
                        {subItem.icon && <subItem.icon className="w-4 h-4 mr-3" />}
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={item.path}
                  onClick={() => item.path && navigate(item.path)}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-primary transition-colors flex items-center whitespace-nowrap"
                >
                  {item.icon && <item.icon className="w-4 h-4 inline-block mr-1" />}
                  {item.label}
                </button>
              )
            ))}
          </nav>
        </div>
        
        {/* User Info and Auth/Logout Button */}
        <div className="flex items-center gap-4">
          {!isLoading && userProfile ? (
            <>
              <div className="text-right text-sm hidden sm:block flex-shrink-0 min-w-0">
                <div className="font-medium text-gray-900 whitespace-nowrap truncate">
                  {userProfile.full_name || 'User'}
                </div>
                <div className="text-gray-500 whitespace-nowrap truncate">
                  {userProfile.role} {userProfile.teams?.name && `• ${userProfile.teams.name}`}
                </div>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="default"
                className="text-destructive hover:text-destructive/90 hidden md:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              size="default"
              className="text-primary hover:bg-primary/5 border-primary hidden md:flex"
            >
              Đăng nhập
            </Button>
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
                      <React.Fragment key={item.id}>
                        <div className="text-sm font-semibold text-gray-700 px-3 py-2 mt-2">
                          {item.label}
                        </div>
                        {item.subItems.map(subItem => (
                          <Button
                            key={subItem.path}
                            variant="ghost"
                            onClick={() => {
                              subItem.path && navigate(subItem.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className="justify-start text-base py-2 px-3 pl-6"
                          >
                            {subItem.icon && <subItem.icon className="w-5 h-5 mr-3" />}
                            {subItem.label}
                          </Button>
                        ))}
                      </React.Fragment>
                    ) : (
                      <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => {
                          item.path && navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start text-base py-2 px-3"
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        {item.label}
                      </Button>
                    )
                  ))}
                  {user ? (
                    <Button 
                      onClick={handleSignOut}
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive/90 py-2 px-3 mt-4"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="justify-start text-primary hover:text-primary/90 py-2 px-3 mt-4"
                    >
                      Đăng nhập
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;