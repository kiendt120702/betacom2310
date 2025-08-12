
import React from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Image, 
  BarChart3, 
  Settings,
  LogOut,
  Shield,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      id: "users",
      label: "Quản lý nhân sự",
      icon: Users,
    },
    {
      id: "training",
      label: "Quản lý đào tạo",
      icon: BookOpen,
    },
    {
      id: "learning-progress",
      label: "Tiến độ học tập",
      icon: GraduationCap,
    },
    {
      id: "banners",
      label: "Quản lý Banner",
      icon: Image,
    },
    {
      id: "analytics",
      label: "Phân tích & Báo cáo",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Cài đặt hệ thống",
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Quản trị hệ thống</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
