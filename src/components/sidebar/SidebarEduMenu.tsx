
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, FileText, Users } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const SidebarEduMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

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

  return (
    <SidebarGroup className="mb-0">
      <SidebarGroupLabel 
        className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        id="edu-label"
      >
        EDU
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="edu-label"
        >
          {eduMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={location.pathname === item.path ? "page" : undefined}
                aria-label={item.label}
                title={state === "collapsed" ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {state === "expanded" && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});

SidebarEduMenu.displayName = "SidebarEduMenu";
