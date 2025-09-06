import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Library,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/usePermissions";

export const SidebarEduMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { data: permissions, isLoading } = usePermissions();

  const handleNavigation = React.useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  const menuItems = [
    {
      id: "shopee-education",
      label: "Shopee",
      icon: ShoppingBag,
      path: "/shopee-education",
      permission: "access_edu_shopee",
    },
    {
      id: "general-training",
      label: "Nội Bộ",
      icon: Library,
      path: "/general-training",
      // No permission needed, accessible to all authenticated users
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (isLoading) return false;
    return !item.permission || permissions?.has(item.permission);
  });

  if (filteredMenuItems.length === 0) return null;

  return (
    <div className="space-y-1">
      {state === "expanded" && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Đào Tạo
        </h3>
      )}

      {filteredMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === "expanded" ? "justify-start" : "justify-center",
              isActive && "bg-primary text-primary-foreground shadow-sm",
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" />
            {state === "expanded" && (
              <span className="font-medium">{item.label}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarEduMenu.displayName = "SidebarEduMenu";

export default SidebarEduMenu;