import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Image, 
  Shield,
  BookOpen,
  GraduationCap,
  Home,
  Sun,
  Moon,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  MessageSquarePlus,
  Crown, // Import Crown for Leader
  User, // Import User for Specialist
  Library, // Import Library for General
  BarChart2 // Import BarChart2 for Traffic Dashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggle,
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    // General Management
    { id: "users", label: "Quản lý nhân sự", icon: Users, group: "general" },
    { id: "thumbnails", label: "Quản lý Thumbnail", icon: Image, group: "general" },
    { id: "feedback", label: "Góp ý & Báo lỗi", icon: MessageSquarePlus, group: "general" },
    
    // Training
    { id: "training", label: "Quản lý đào tạo", icon: BookOpen, group: "training" },
    { id: "learning-progress", label: "Tiến độ học tập", icon: GraduationCap, group: "training" },
    { id: "leader-training-management", label: "Đào tạo Leader", icon: Crown, group: "training" },
    { id: "specialist-training-management", label: "Đào tạo Chuyên viên", icon: User, group: "training" },
    { id: "general-training-management", label: "Đào tạo Chung", icon: Library, group: "training" },

    // Analytics
    { id: "traffic-dashboard", label: "Thống kê Traffic", icon: BarChart2, group: "analytics" }, // New item
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className={cn("flex items-center gap-3 h-12", collapsed && "justify-center")}>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>}
        </div>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-3 mt-4", collapsed && "justify-center p-0 h-10 w-10")}
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4" />
          {!collapsed && <span>Về trang chủ</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {!collapsed && (
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            QUẢN LÝ CHUNG
          </h3>
        )}
        {menuItems.filter(item => item.group === "general").map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                collapsed && "justify-center p-0 h-12 w-12",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Button>
          );
        })}

        {!collapsed && (
          <h3 className="px-3 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            ĐÀO TẠO
          </h3>
        )}
        {menuItems.filter(item => item.group === "training").map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                collapsed && "justify-center p-0 h-12 w-12",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Button>
          );
        })}

        {!collapsed && (
          <h3 className="px-3 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            THỐNG KÊ
          </h3>
        )}
        {menuItems.filter(item => item.group === "analytics").map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12",
                collapsed && "justify-center p-0 h-12 w-12",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border mt-auto space-y-2">
        {profileLoading ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            {!collapsed && <Skeleton className="h-4 w-24" />}
          </div>
        ) : userProfile ? (
          <>
            <Button
              variant="ghost"
              className={cn("w-full justify-between items-center", collapsed && "justify-center p-0 h-9 w-9")}
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-2">
                {theme === "light" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </div>
              {!collapsed && <span className="text-sm text-muted-foreground">Giao diện</span>}
            </Button>
            <div className={cn("w-full flex items-center justify-start gap-2 px-2 py-2 rounded-md text-sm font-medium text-foreground", collapsed && "justify-center p-0")}>
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || "A"}
              </div>
              {!collapsed && (
                <div className="flex-1 truncate text-left">
                  <p className="font-semibold truncate">{userProfile.full_name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.role}</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className={cn("w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive", collapsed && "justify-center p-0 h-9 w-9")}
            >
              {!collapsed && <LogOut className="mr-2 h-4 w-4" />}
              {collapsed && <LogOut className="h-4 w-4" />}
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-background shadow-md" onClick={toggleSidebar}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}
        <div className={`fixed top-0 left-0 z-40 w-80 bg-card border-r border-border flex flex-col h-screen transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent collapsed={false} />
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={cn("fixed top-0 left-0 z-40 bg-card border-r border-border flex flex-col h-screen transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      <SidebarContent collapsed={isCollapsed} />
      <div className="p-3 border-t border-border">
        <Button variant="ghost" className="w-full justify-center" onClick={onToggle}>
          {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4 mr-2" /><span>Thu gọn</span></>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;