
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Video, FileText, GraduationCap } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const eduMenuItems = [
  {
    title: "Quy trình đào tạo",
    icon: GraduationCap,
    url: "/training-process",
  },
  {
    title: "Nội dung đào tạo",
    icon: BookOpen,
    url: "/training-content",
  },
  {
    title: "Nộp phần ôn tập",
    icon: FileText,
    url: "/assignment-submission",
  },
];

export const SidebarEduMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();

  const isActive = React.useCallback((path: string) => location.pathname === path, [location.pathname]);
  
  const handleNavigation = React.useCallback((url: string) => {
    navigate(url);
  }, [navigate]);

  // Only render if user is logged in
  if (!user) return null;

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
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                onClick={() => handleNavigation(item.url)}
                className={`w-full h-12 sm:h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                  isActive(item.url)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={isActive(item.url) ? "page" : undefined}
                aria-label={item.title}
                title={state === "collapsed" ? item.title : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {state === "expanded" && (
                  <span className="ml-3 truncate">{item.title}</span>
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
