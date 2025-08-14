import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, BarChart3, Users, FileText } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const SidebarManagement = () => {
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

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
    {
      id: "leader-personnel", // New menu item for leaders
      title: "Quản lý nhân sự",
      path: "/leader-personnel",
      icon: Users,
      roles: ["admin", "leader"], // Visible to admin and leader
    },
    {
      id: "comprehensive-reports", // New menu item for reports
      title: "Báo Cáo Tổng Hợp",
      path: "/comprehensive-reports",
      icon: FileText,
      roles: ["admin", "leader"], // Visible to admin and leader
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile.role);
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
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10", // Giảm từ h-12 xuống h-10
              state === 'expanded' ? "justify-start" : "justify-center",
              isActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" /> {/* Giảm từ w-5 h-5 xuống w-4 h-4 */}
            {state === 'expanded' && <span className="font-medium">{item.title}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default SidebarManagement;