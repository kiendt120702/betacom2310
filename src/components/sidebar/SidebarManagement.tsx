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
import { cn } from "@/lib/utils";

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
          className="space-y-1" 
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
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.title}
                  title={state === "collapsed" ? item.title : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {state === "expanded" && (
                    <span className="ml-2 truncate">{item.title}</span>
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