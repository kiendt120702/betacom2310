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
import { useUserProfile } from "@/hooks/useUserProfile";

export const SidebarToolsMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { data: userProfile } = useUserProfile();

  const menuItems = React.useMemo(() => {
    const items: any[] = [
      {
        id: "thumbnail",
        label: "Thư viện Thumbnail",
        icon: Upload,
        path: "/thumbnail",
      },
      {
        id: "fast-delivery",
        label: "Giao Hàng Nhanh",
        icon: Truck,
        path: "/fast-delivery",
      },
      {
        id: "gpt4o-mini",
        label: "ChatGPT",
        icon: Bot,
        path: "/gpt4o-mini",
        tag: "Hot",
      },
      {
        id: "average-rating",
        label: "Tính Điểm TB",
        icon: Star,
        path: "/average-rating",
      },
    ];

    if (userProfile) {
      items.push(
        { type: "heading", label: "BÁO CÁO DOANH SỐ" },
        {
          id: "comprehensive-reports",
          label: "Báo Cáo Tổng Hợp",
          icon: FileText,
          path: "/comprehensive-reports",
          isSubItem: true,
        },
        {
          id: "daily-sales-report",
          label: "Báo cáo Hàng ngày",
          icon: BarChart3,
          path: "/daily-sales-report",
          isSubItem: true,
          roles: ["admin"],
        },
        {
          id: "goal-setting",
          label: "Quản lý Mục tiêu",
          icon: Target,
          path: "/goal-setting",
          isSubItem: true,
        },
        {
          id: "shop-management",
          label: "Quản lý Shop",
          icon: Store,
          path: "/shop-management",
          isSubItem: true,
        }
      );

      items.push({
        id: "sales-dashboard",
        label: "Dashboard",
        icon: BarChart3,
        path: "/sales-dashboard",
        isSubItem: true,
        roles: ["admin", "leader", "trưởng phòng"],
      });
    }

    return items;
  }, [userProfile]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!("roles" in item) || !item.roles) return true;
    if (!userProfile) return false;
    return item.roles.includes(userProfile.role);
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
          CHUNG{" "}
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
              item.isSubItem && state === "expanded" && "pl-6",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !item.disabled && handleNavigation(item.path)}
            disabled={item.disabled}>
            <Icon className="w-4 h-4" />
            {state === "expanded" && (
              <>
                <span className="font-medium">{item.label}</span>
                {item.tag && (
                  <Badge
                    variant="destructive"
                    className="ml-auto text-xs px-2 py-0.5">
                    {item.tag}
                  </Badge>
                )}
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