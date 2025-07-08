
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from './ThemeProvider';
import { 
  LayoutGrid, 
  Package, 
  MessageCircle, 
  Search, 
  HelpCircle, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { toast } = useToast();
  
  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

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

  const mainMenuItems = [
    {
      title: "Thumbnail",
      url: "/thumbnail",
      icon: LayoutGrid,
    },
    {
      title: "Đăng nhanh SP",
      url: "/quick-post",
      icon: Package,
    },
  ];

  const chatMenuItems = [
    {
      title: "Tư vấn AI",
      url: "/chatbot",
      icon: MessageCircle,
    },
    {
      title: "SEO Shopee",
      url: "/seo-chatbot",
      icon: Search,
    },
    {
      title: "Hỏi đáp chung",
      url: "/general-chatbot",
      icon: HelpCircle,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r bg-white">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
            alt="Betacom Logo"
            className="h-8 w-auto flex-shrink-0"
          />
          {state === 'expanded' && (
            <span className="font-bold text-xl text-gray-900 tracking-tight">Betacom</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Main Menu Section */}
        <SidebarGroup className="mb-6">
          <SidebarGroupLabel className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            CHÍNH
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    className={`w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.url)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {state === 'expanded' && <span className="truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat AI Section */}
        {user && (
          <SidebarGroup className="mb-6">
            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <MessageCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    {state === 'expanded' && (
                      <>
                        <span className="flex-1 text-left">CHAT AI</span>
                        <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mt-2 space-y-1 border-l-2 border-gray-100 ml-4 pl-4">
                    {chatMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.url)}
                          onClick={() => navigate(item.url)}
                          className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive(item.url)
                              ? 'bg-primary/10 text-primary border-l-2 border-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                          {state === 'expanded' && <span className="truncate">{item.title}</span>}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Management Section */}
        {(isAdmin || isLeader || isChuyenVien) && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive('/management')}
                    onClick={() => navigate('/management')}
                    className={`w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive('/management')
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                    {state === 'expanded' && <span className="truncate">Management</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 px-3 py-4 space-y-3">
        {/* Theme Toggle */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start h-10 px-3 text-sm border-gray-200 hover:bg-gray-50">
                {theme === 'light' && <Sun className="w-4 h-4 mr-2" />}
                {theme === 'dark' && <Moon className="w-4 h-4 mr-2" />}
                {theme === 'system' && <Monitor className="w-4 h-4 mr-2" />}
                {state === 'expanded' && (
                  <span className="truncate">
                    {theme === 'light' && 'Sáng'}
                    {theme === 'dark' && 'Tối'}
                    {theme === 'system' && 'Hệ thống'}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="w-4 h-4 mr-2" />
                Sáng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="w-4 h-4 mr-2" />
                Tối
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="w-4 h-4 mr-2" />
                Hệ thống
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            {state === 'expanded' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-sm">
                    {userProfile.full_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate capitalize">
                    {userProfile.role}
                    {userProfile.teams?.name && (
                      <span className="text-gray-400"> • {userProfile.teams.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                  {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auth Button */}
        {user ? (
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 h-10 px-3 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {state === 'expanded' && <span className="truncate">Đăng xuất</span>}
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            size="sm"
            className="w-full justify-start h-10 px-3 text-sm border-gray-200 hover:bg-gray-50"
          >
            <User className="w-4 h-4 mr-2" />
            {state === 'expanded' && <span className="truncate">Đăng nhập</span>}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
