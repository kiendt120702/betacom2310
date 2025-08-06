import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Search,
  Upload,
  Star,
  Target,
  Grid3X3,
  DollarSign, // New import for the icon
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const SidebarNavigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const navigationItems = React.useMemo(() => [
    { id: "home", label: "Trang chủ", icon: Home, path: "/" },
    { id: "thumbnail", label: "Thumbnail", icon: Upload, path: "/thumbnail" },
    {
      id: "average-rating",
      label: "Tính Điểm TB",
      icon: Star,
      path: "/average-rating",
    },
    { id: "tactic", label: "Chiến thuật", icon: Target, path: "/tactic" },
    {
      id: "shopee-fees",
      label: "Phí Sàn Shopee",
      icon: DollarSign,
      path: "/shopee-fees",
    },
  ], []);

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel 
        className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        id="navigation-label"
      >
        NAVIGATION
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="navigation-label"
        >
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={location.pathname === item.path ? "page" : undefined}
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

SidebarNavigation.displayName = "SidebarNavigation";