import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Image,
  Shield,
  BookOpen,
  GraduationCap,
  MessageSquarePlus,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface AdminSidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AdminSidebarNavigation = React.memo(
  ({ activeSection, onSectionChange }: AdminSidebarNavigationProps) => {
    const navigate = useNavigate();
    const { state } = useSidebar();

    const menuItems = [
      { id: "dashboard", label: "Tổng quan", icon: Home }, // Added Dashboard
      { id: "users", label: "Quản lý nhân sự", icon: Users },
      { id: "training", label: "Quản lý đào tạo", icon: BookOpen },
      { id: "learning-progress", label: "Tiến độ học tập", icon: GraduationCap },
      { id: "thumbnails", label: "Quản lý Thumbnail", icon: Image },
      { id: "feedback", label: "Góp ý & Báo lỗi", icon: MessageSquarePlus },
    ];

    return (
      <div className="space-y-1">
        {state === "expanded" && (
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            QUẢN LÝ
          </h3>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full gap-3 h-10",
                state === "expanded" ? "justify-start" : "justify-center",
                isActive && "bg-primary text-primary-foreground shadow-sm",
              )}
              onClick={() => onSectionChange(item.id)}
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
  },
);

AdminSidebarNavigation.displayName = "AdminSidebarNavigation";