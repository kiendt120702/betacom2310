import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Upload,
  Star,
  Target,
  FileText,
  BarChart3,
  Users,
  Store,
  Truck,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/usePermissions";

export const SidebarToolsMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { data: permissions, isLoading } = usePermissions();

  const menuItems = React.useMemo(() => [
    {
      id: "thumbnail",
      label: "Thư Viện Thumbnail",
      icon: Upload,
      path: "/thumbnail",
      permission: "access_thumbnail_gallery",
      group: "general",
    },
    {
      id: "fast-delivery",
      label: "Giao Hàng Nhanh",
      icon: Truck,
      path: "/fast-delivery",
      permission: "access_fast_delivery_tool",
      group: "general",
    },
    {
      id: "average-rating",
      label: "Tính Điểm Trung Bình",
      icon: Star,
      path: "/average-rating",
      permission: "access_rating_calculator",
      group: "general",
    },
    { type: "heading", label: "SHOPEE", permission: "access_shopee_reports" },
    {
      id: "shopee-sales-dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/shopee-sales-dashboard",
      permission: "access_shopee_reports",
      isSubItem: true,
    },
    {
      id: "shopee-comprehensive-reports",
      label: "Báo Cáo Tổng Hợp",
      icon: FileText,
      path: "/shopee-comprehensive-reports",
      permission: "access_shopee_reports",
      isSubItem: true,
    },
    {
      id: "shopee-daily-sales-report",
      label: "Doanh Số Hàng ngày",
      icon: BarChart3,
      path: "/shopee-daily-sales-report",
      permission: "access_shopee_reports",
      isSubItem: true,
    },
    {
      id: "shopee-goal-setting",
      label: "Mục Tiêu Tháng Shop",
      icon: Target,
      path: "/shopee-goal-setting",
      permission: "access_shopee_reports",
      isSubItem: true,
    },
    {
      id: "shopee-shop-management",
      label: "Quản Lý Shop",
      icon: Store,
      path: "/shopee-shop-management",
      permission: "access_shopee_reports",
      isSubItem: true,
    },
    { type: "heading", label: "TIKTOK", permission: "access_tiktok_reports" },
    {
      id: "tiktok-sales-dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/tiktok-sales-dashboard",
      permission: "access_tiktok_reports",
      isSubItem: true,
    },
    {
      id: "tiktok-comprehensive-reports",
      label: "Báo Cáo Tổng Hợp",
      icon: FileText,
      path: "/tiktok-comprehensive-reports",
      permission: "access_tiktok_reports",
      isSubItem: true,
    },
    {
      id: "tiktok-daily-sales-report",
      label: "Doanh Số Hàng ngày",
      icon: BarChart3,
      path: "/tiktok-daily-sales-report",
      permission: "access_tiktok_reports",
      isSubItem: true,
    },
    {
      id: "tiktok-goal-setting",
      label: "Mục Tiêu Tháng Shop",
      icon: Target,
      path: "/tiktok-goal-setting",
      permission: "access_tiktok_reports",
      isSubItem: true,
    },
    {
      id: "tiktok-shop-management",
      label: "Quản Lý Shop",
      icon: Store,
      path: "/tiktok-shop-management",
      permission: "access_tiktok_reports",
      isSubItem: true,
    },
  ], []);

  const filteredMenuItems = menuItems.filter(item => {
    if (isLoading) return false; // Wait for permissions to load
    return !item.permission || permissions?.has(item.permission);
  });

  const handleNavigation = React.useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const isActive = React.useCallback(
    (path: string) => location.pathname.startsWith(path),
    [location.pathname]
  );

  return (
    <div className="space-y-1">
      {state === "expanded" && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          CÔNG CỤ
        </h3>
      )}

      {filteredMenuItems.map((item) => {
        if (item.type === "heading") {
          return state === "expanded" ? (
            <h4
              key={item.label}
              className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label}
            </h4>
          ) : null;
        }

        const Icon = item.icon;
        const itemActive = isActive(item.path);

        return (
          <Button
            key={item.id}
            variant={itemActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === "expanded" ? "justify-start" : "justify-center",
              itemActive && "bg-primary text-primary-foreground shadow-sm",
              item.isSubItem && state === "expanded" && "pl-6"
            )}
            onClick={() => handleNavigation(item.path)}>
            <Icon className="w-4 h-4" />
            {state === "expanded" && (
              <>
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarToolsMenu.displayName = "SidebarToolsMenu";

export default SidebarToolsMenu;