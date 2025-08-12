
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

export const SidebarEduMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile } = useUserProfile();

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const eduMenuItems = [
    {
      id: "training-process",
      label: "Quy trình đào tạo",
      icon: BookOpen,
      path: "/training-process",
    },
    {
      id: "training-content",
      label: "Nội dung đào tạo",
      icon: GraduationCap,
      path: "/training-content",
    },
    {
      id: "assignment-submission",
      label: "Nộp bài tập",
      icon: FileText,
      path: "/assignment-submission",
    },
  ];

  // Chỉ hiển thị menu EDU nếu người dùng có vai trò 'học việc/thử việc'
  if (userProfile?.role !== "học việc/thử việc") {
    return null;
  }

  return (
    <div className="space-y-1">
      {/* Section Label với khoảng cách nhỏ hơn */}
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        EDU
      </h3>
      
      {/* Education Items với Button spacing nhỏ hơn */}
      {eduMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10", // Giảm từ h-12 xuống h-10
              isActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" /> {/* Giảm từ w-5 h-5 xuống w-4 h-4 */}
            <span className="font-medium">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
});

SidebarEduMenu.displayName = "SidebarEduMenu";
