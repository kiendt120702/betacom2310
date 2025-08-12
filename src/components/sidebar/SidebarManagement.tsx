import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

const SidebarManagement = () => {
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  if (!userProfile) return null;

  const allMenuItems = [
    {
      id: "my-profile",
      title: "Hồ sơ của tôi",
      path: "/my-profile",
      icon: User,
    },
    {
      id: "learning-progress",
      title: "Tiến độ học tập",
      path: "/management",
      icon: BarChart3,
      roles: ["học việc/thử việc"],
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile.role);
  });

  if (menuItems.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Section Label tương tự AdminSidebar */}
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        CÀI ĐẶT
      </h3>
      
      {/* Settings Items với Button styling tương tự AdminSidebar */}
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-12",
              isActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default SidebarManagement;