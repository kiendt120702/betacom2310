import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { User, BarChart3 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const SidebarManagement = () => {
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  if (!userProfile) return null;

  const allMenuItems = [
    {
      id: "my-profile",
      title: "Hồ sơ của tôi",
      path: "/my-profile",
      icon: User,
    },
    {
      id: "learning-progress",
      title: "Tiến độ học tập",
      path: "/management",
      icon: BarChart3,
      roles: ["học việc/thử việc"],
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile.role);
  });

  if (menuItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel 
        className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        id="settings-label"
      >
        Cài đặt
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="settings-label"
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleNavigation(item.path)}
                  className={`group w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.title}
                  title={state === "collapsed" ? item.title : undefined}
                >
                  <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110" aria-hidden="true" />
                    {isActive && (
                      <div className="absolute inset-0 bg-white/20 rounded-sm scale-150 opacity-50"></div>
                    )}
                  </div>
                  {state === "expanded" && (
                    <span className="ml-3 truncate transition-all duration-200 group-hover:translate-x-0.5">{item.title}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarManagement;