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
  MessageSquarePlus, // Import new icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader"; // Import SidebarHeader
import { SidebarFooter } from "@/components/sidebar/SidebarFooter"; // Import SidebarFooter
import { AdminSidebarNavigation } from "./AdminSidebarNavigation"; // Import new AdminSidebarNavigation

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
      <div className="border-b border-border relative">
        <SidebarHeader />
        {/* "Về trang chủ" button */}
        <div className="p-3">
          <Button
            variant="outline"
            className={cn("w-full justify-start gap-3 h-9 text-sm", collapsed && "justify-center p-0 h-10 w-10")}
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4" />
            {!collapsed && <span>Về trang chủ</span>}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        <AdminSidebarNavigation activeSection={activeSection} onSectionChange={onSectionChange} />
      </nav>

      {/* Footer */}
      <div className="border-t border-border mt-auto">
        <SidebarFooter />
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