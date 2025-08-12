
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Star,
  Target,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SidebarNavigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="space-y-1">
      {/* Section Label với khoảng cách nhỏ hơn */}
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        NAVIGATION
      </h3>
      
      {/* Navigation Items với Button spacing nhỏ hơn */}
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10", // Giảm từ h-12 xuống h-10
              isActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" /> {/* Giảm từ w-5 h-5 xuống w-4 h-4 */}
            <span className="font-medium">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
});

SidebarNavigation.displayName = "SidebarNavigation";
