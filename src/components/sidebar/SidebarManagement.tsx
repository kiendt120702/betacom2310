
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings,
  Users,
  Brain,
  Search,
  Package,
  BarChart2,
  Users2,
  User as UserIcon,
  GraduationCap,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const SidebarManagement = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();

  // Determine active tab based on URL hash
  const activeTab = React.useMemo(() => location.hash.replace("#", ""), [location.hash]);
  
  const handleNavigation = React.useCallback((itemId: string) => {
    navigate(`/management#${itemId}`);
  }, [navigate]);

  const managementMenuItems = useMemo(() => {
    const items = [
      {
        id: "my-profile",
        label: "Hồ sơ của tôi",
        icon: UserIcon,
        roles: ["admin", "leader", "chuyên viên"],
      },
      {
        id: "users",
        label: "Quản lý User",
        icon: Users,
        roles: ["admin", "leader"],
      },
      { id: "teams", label: "Quản lý Team", icon: Users2, roles: ["admin"] },
      { id: "training-management", label: "Quản lý Đào tạo", icon: GraduationCap, roles: ["admin"] },
    ];

    // Filter items based on user's role
    return items.filter((item) =>
      userProfile?.role ? item.roles.includes(userProfile.role) : false,
    );
  }, [userProfile]);

  const isAdmin = userProfile?.role === "admin";
  const isLeader = userProfile?.role === "leader";
  const isChuyenVien = userProfile?.role === "chuyên viên";

  // Only render the management section if the user has access to at least one item
  if (!isAdmin && !isLeader && !isChuyenVien) return null;

  return (
    <SidebarGroup className="mb-0">
      <SidebarGroupLabel 
        className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        id="settings-label"
      >
        SETTING
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="settings-label"
        >
          {managementMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={activeTab === item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={activeTab === item.id ? "page" : undefined}
                aria-label={item.label}
                title={state === "collapsed" ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {state === "expanded" && (
                  <span className="ml-3 truncate">{item.label}</span>
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
