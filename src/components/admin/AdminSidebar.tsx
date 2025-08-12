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
  GraduationCap,
  Home,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { theme, setTheme } = useTheme();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="fixed top-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 h-12">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 mt-4"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
      <div className="p-3 border-t border-border mt-auto space-y-2">
        {profileLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : userProfile ? (
          <>
            <Button
              variant="ghost"
              className="w-full justify-between items-center"
              onClick={toggleTheme}
            >
              <span className="text-sm text-muted-foreground">Giao diện</span>
              <div className="flex items-center">
                {theme === "light" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </div>
            </Button>
            <div className="w-full flex items-center justify-start gap-2 px-2 py-2 rounded-md text-sm font-medium text-foreground">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {userProfile.full_name?.charAt(0).toUpperCase() ||
                  userProfile.email?.charAt(0).toUpperCase() ||
                  "A"}
              </div>
              <div className="flex-1 truncate text-left">
                <p className="font-semibold truncate">
                  {userProfile.full_name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile.role}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </>
        ) : (
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;