
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, BookOpen, User } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

const managementItems = [
  {
    title: "Quản lý User",
    icon: User,
    url: "/management",
    adminOnly: false, // Both admin and leader can access
  },
  {
    title: "Quản lý Team",
    icon: Users,
    url: "/admin/teams",
    adminOnly: true,
  },
  {
    title: "Quản lý đào tạo",
    icon: BookOpen,
    url: "/admin/training",
    adminOnly: true,
  },
];

export const SidebarManagement = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();

  const isActive = React.useCallback((path: string) => location.pathname === path, [location.pathname]);
  
  const handleNavigation = React.useCallback((url: string) => {
    navigate(url);
  }, [navigate]);

  // Only render if user is logged in
  if (!user || !userProfile) return null;

  // Filter items based on user role
  const filteredItems = managementItems.filter(item => {
    if (item.adminOnly) {
      return userProfile.role === "admin";
    }
    // For non-admin only items, allow admin, leader, and chuyên viên
    return userProfile.role === "admin" || userProfile.role === "leader" || userProfile.role === "chuyên viên";
  });

  // Don't render the section if no items are available for the user
  if (filteredItems.length === 0) return null;

  return (
    <SidebarGroup className="mb-0">
      <SidebarGroupLabel 
        className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        id="management-label"
      >
        QUẢN LÝ
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="management-label"
        >
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                onClick={() => handleNavigation(item.url)}
                className={`w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                  isActive(item.url)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={isActive(item.url) ? "page" : undefined}
                aria-label={item.title}
                title={state === "collapsed" ? item.title : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {state === "expanded" && (
                  <span className="ml-3 truncate">{item.title}</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});

SidebarManagement.displayName = "SidebarManagement";
