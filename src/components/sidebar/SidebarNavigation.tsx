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
  DollarSign,
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
    // Removed the 'Trang chủ' item
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
                className={`group w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation hover:scale-[1.02] active:scale-[0.98] ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
                }`}
                aria-current={location.pathname === item.path ? "page" : undefined}
                aria-label={item.label}
                title={state === "collapsed" ? item.label : undefined}
              >
                <div className={`relative ${location.pathname === item.path ? 'animate-pulse' : ''}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110" aria-hidden="true" />
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-white/20 rounded-sm scale-150 opacity-50"></div>
                  )}
                </div>
                {state === "expanded" && (
                  <span className="ml-3 truncate transition-all duration-200 group-hover:translate-x-0.5">{item.label}</span>
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