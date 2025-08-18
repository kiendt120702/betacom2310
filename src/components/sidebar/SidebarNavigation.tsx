import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Star,
  Target,
  DollarSign,
  Truck,
  FileText,
  BarChart3,
  Users,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/useUserProfile";

export const SidebarNavigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { data: userProfile } = useUserProfile();

  const navigationItems = React.useMemo(() => {
    const items: any[] = [
      { id: "thumbnail", label: "Thư viện Thumbnail", icon: Upload, path: "/thumbnail" },
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
          id: "sales-dashboard",
          label: "Dashboard",
          icon: BarChart3,
          path: "/sales-dashboard",
          isSubItem: true,
        },
        {
          id: "comprehensive-reports",
          label: "Báo cáo Chi tiết",
          icon: FileText,
          path: "/comprehensive-reports",
          isSubItem: true,
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
    }

    if (userProfile && (userProfile.role === 'admin' || userProfile.role === 'leader')) {
      items.push(
        {
          id: "employee-management",
          label: "Quản lý Nhân sự",
          icon: Users,
          path: "/employee-management",
          isSubItem: true,
        }
      );
    }

    items.push(
      { type: "heading", label: "Tỷ lệ giao hàng nhanh" },
      {
        id: "fast-delivery-theory",
        label: "Lý thuyết",
        icon: Truck,
        path: "/fast-delivery/theory",
        isSubItem: true,
      },
      {
        id: "fast-delivery-calculation",
        label: "Cách tính",
        icon: Truck,
        path: "/fast-delivery/calculation",
        isSubItem: true,
        disabled: false,
        tag: null,
      }
    );
    
    return items;
  }, [userProfile]);

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="space-y-1">
      {state === 'expanded' && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          NAVIGATION
        </h3>
      )}
      
      {navigationItems.map((item) => {
        if ("type" in item && item.type === "heading") {
          return state === 'expanded' ? (
            <h4 key={item.label} className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label}
            </h4>
          ) : null;
        }
        
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === 'expanded' ? "justify-start" : "justify-center",
              isActive && "bg-primary text-primary-foreground shadow-sm",
              "isSubItem" in item && item.isSubItem && state === 'expanded' && "pl-6",
              "disabled" in item && item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !("disabled" in item && item.disabled) && handleNavigation(item.path)}
            disabled={"disabled" in item && item.disabled}
          >
            <Icon className="w-4 h-4" />
            {state === 'expanded' && (
              <>
                <span className="font-medium">{item.label}</span>
                {"tag" in item && item.tag && (
                  <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
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

SidebarNavigation.displayName = "SidebarNavigation";