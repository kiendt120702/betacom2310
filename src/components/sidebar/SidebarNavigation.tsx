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
        // Type guard to narrow down 'item' to NavigationItem
        if ("type" in item) { // This checks if 'type' property exists, which means it's a NavigationHeading
          return state === 'expanded' ? (
            <h4 key={item.label} className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label}
            </h4>
          ) : null;
        } else { // If 'type' property does not exist, it must be a NavigationItem
          const navItem = item; // Assign to a new variable to help TypeScript with narrowing
          const Icon = navItem.icon;
          const isActive = location.pathname === navItem.path;
          
          return (
            <Button
              key={navItem.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full gap-3 h-10",
                state === 'expanded' ? "justify-start" : "justify-center",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                navItem.isSubItem && state === 'expanded' && "pl-6",
                navItem.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !navItem.disabled && handleNavigation(navItem.path)}
              disabled={navItem.disabled}
            >
              <Icon className="w-4 h-4" />
              {state === 'expanded' && (
                <>
                  <span className="font-medium">{navItem.label}</span>
                  {navItem.tag && (
                    <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
                      {navItem.tag}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        }
      })}
    </div>
  );
});

SidebarNavigation.displayName = "SidebarNavigation";