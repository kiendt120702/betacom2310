import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Star,
  Target,
  DollarSign,
  Truck, // New icon for delivery
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Need to import Badge

export const SidebarNavigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = React.useMemo(() => [
    // Removed: { id: "home", label: "Trang chủ", icon: Home, path: "/" },
    { id: "thumbnail", label: "Thư viện Thumbnail", icon: Upload, path: "/thumbnail" },
    {
      id: "average-rating",
      label: "Tính Điểm TB",
      icon: Star,
      path: "/average-rating",
    },
    // New section for Fast Delivery Rate
    { type: "heading", label: "Tỷ lệ giao hàng nhanh" }, // Custom type for heading
    {
      id: "fast-delivery-theory",
      label: "Lý thuyết",
      icon: Truck,
      path: "/fast-delivery/theory",
      isSubItem: true, // Custom prop for styling
    },
    {
      id: "fast-delivery-calculation",
      label: "Cách tính",
      icon: Truck,
      path: "/fast-delivery/calculation",
      isSubItem: true,
      disabled: true,
      tag: "Coming Soon",
    },
  ], []);

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        NAVIGATION
      </h3>
      
      {navigationItems.map((item) => {
        if ("type" in item && item.type === "heading") {
          return (
            <h4 key={item.label} className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label}
            </h4>
          );
        }
        
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10",
              isActive && "bg-primary text-primary-foreground shadow-sm",
              "isSubItem" in item && item.isSubItem && "pl-6", // Indent sub-items
              "disabled" in item && item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !("disabled" in item && item.disabled) && handleNavigation(item.path)}
            disabled={"disabled" in item && item.disabled}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{item.label}</span>
            {"tag" in item && item.tag && (
              <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
                {item.tag}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarNavigation.displayName = "SidebarNavigation";