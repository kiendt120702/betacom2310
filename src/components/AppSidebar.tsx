
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
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
            alt="Betacom Logo"
            className="h-8 w-auto"
          />
          {state === 'expanded' && (
            <span className="font-semibold text-lg">Betacom</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <MessageCircle className="w-4 h-4" />
                    <span>CHAT AI</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {chatMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.url)}
                          onClick={() => navigate(item.url)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarGroup>
        )}

        {(isAdmin || isLeader || isChuyenVien) && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive('/management')}
                    onClick={() => navigate('/management')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {/* Theme Toggle */}
        <div className="mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                {theme === 'light' && <Sun className="w-4 h-4 mr-2" />}
                {theme === 'dark' && <Moon className="w-4 h-4 mr-2" />}
                {theme === 'system' && <Monitor className="w-4 h-4 mr-2" />}
                {state === 'expanded' && (
                  <span>
                    {theme === 'light' && 'Sáng'}
                    {theme === 'dark' && 'Tối'}
                    {theme === 'system' && 'Hệ thống'}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

        {/* User Info */}
        {userProfile && (
          <div className="mb-3">
            {state === 'expanded' ? (
              <div className="text-sm">
                <div className="font-medium text-foreground truncate">
                  {userProfile.full_name || 'User'}
                </div>
                <div className="text-muted-foreground truncate">
                  {userProfile.role} {userProfile.teams?.name && `• ${userProfile.teams.name}`}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        {user ? (
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {state === 'expanded' && <span>Đăng xuất</span>}
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            {state === 'expanded' && <span>Đăng nhập</span>}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
