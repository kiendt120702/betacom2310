import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const fastDeliveryItems = [
  {
    id: "fast-delivery-theory",
    label: "Lý thuyết",
    icon: Truck,
    path: "/fast-delivery/theory",
  },
  {
    id: "fast-delivery-calculation",
    label: "Cách tính",
    icon: Truck,
    path: "/fast-delivery/calculation",
  },
];

export const SidebarFastDeliveryMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = React.useCallback((path: string) => location.pathname === path, [location.pathname]);
  
  const handleNavigation = React.useCallback((url: string) => {
    navigate(url);
  }, [navigate]);

  return (
    <div className="space-y-1">
      {state === 'expanded' && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          TỶ LỆ GIAO HÀNG NHANH
        </h3>
      )}
      
      {fastDeliveryItems.map((item) => {
        const Icon = item.icon;
        const itemActive = isActive(item.path);
        
        return (
          <Button
            key={item.id}
            variant={itemActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === 'expanded' ? "justify-start" : "justify-center",
              itemActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" />
            {state === 'expanded' && (
              <span className="font-medium">{item.label}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarFastDeliveryMenu.displayName = "SidebarFastDeliveryMenu";

export default SidebarFastDeliveryMenu;