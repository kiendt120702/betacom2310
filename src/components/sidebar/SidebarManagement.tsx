import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, BarChart3, Users, FileText, GraduationCap, Settings, BookOpen } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const SidebarManagement = () => {
  const navigate = useNavigate(); // Corrected: Changed useLocation to useNavigate
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
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
      path: "/learning-progress",
      icon: GraduationCap,
    },
    {
      id: "leader-personnel", // New menu item for leaders
      title: "Quản lý nhân sự",
      path: "/leader-personnel",
      icon: Users,
      roles: ["admin", "leader"], // Visible to admin and leader
    },
    {
      id: "training-management",
      title: "Quản lý Đào tạo",
      path: "/training-management",
      icon: BookOpen,
      roles: ["admin", "trưởng phòng"],
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    if (!userProfile) return false;

    // Special check for Training Management
    if (item.id === 'training-management') {
      const isAdmin = userProfile.role === 'admin';
      const isTrainingDeptHead = userProfile.role === 'trưởng phòng' && userProfile.teams?.name === 'Phòng Đào Tạo';
      return isAdmin || isTrainingDeptHead;
    }

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