import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Star,
  Target,
  DollarSign,
  Truck,
  BarChart3, // New icon
  LucideIcon // Fixed: Import LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon; // Fixed: Explicitly type icon
  path: string;
  isSubItem?: boolean;
  disabled?: boolean;
  tag?: string | null; // Fixed: Allow tag to be string or null
}

interface NavigationHeading {
  type: "heading";
  label: string;
}

type NavItem = NavigationItem | NavigationHeading;

export const SidebarNavigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const navigationItems: NavItem[] = React.useMemo(() => [ // Fixed: Explicitly type navigationItems
    { id: "thumbnail", label: "Thư viện Thumbnail", icon: Upload, path: "/thumbnail" },
    {
      id: "average-rating",
      label: "Tính Điểm TB",
      icon: Star,
      path: "/average-rating",
    },
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
    },
  ], []);

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
        
        // Now TypeScript knows 'item' is of type NavigationItem
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
              item.isSubItem && state === 'expanded' && "pl-6",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !item.disabled && handleNavigation(item.path)}
            disabled={item.disabled}
          >
            <Icon className="w-4 h-4" />
            {state === 'expanded' && (
              <>
                <span className="font-medium">{item.label}</span>
                {item.tag && (
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