import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useEduShopeeAccess } from "@/hooks/useEduShopeeAccess";

const SidebarManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();
  const { hasAccess: canAccessEduShopee } = useEduShopeeAccess();

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
  ];

  const menuItems = allMenuItems.filter(item => {
    if ('condition' in item && item.condition === false) return false;
    
    if (!("roles" in item) || !item.roles) return true;
    if (!userProfile) return false;

    // Special check for Training Management
    if (item.id === 'training-management') {
      const isAdmin = userProfile.role === 'admin';
      const isTrainingDeptHead = userProfile.role === 'trưởng phòng' && userProfile.departments?.name === 'Phòng Đào Tạo';
      return isAdmin || isTrainingDeptHead;
    }

    return (item.roles as string[]).includes(userProfile.role);
  });

  if (menuItems.length === 0) return null;

  return (
    <div className="space-y-1">
      {state === 'expanded' && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          CÀI ĐẶT
        </h3>
      )}
      
      {/* Settings Items với Button spacing nhỏ hơn */}
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === 'expanded' ? "justify-start" : "justify-center",
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" />
            {state === 'expanded' && <span className="font-medium">{item.title}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default SidebarManagement;