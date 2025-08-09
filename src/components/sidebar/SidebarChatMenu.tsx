
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, FileText } from "lucide-react";
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

const chatMenuItems = [
  {
    title: "SEO tên sản phẩm Shopee",
    icon: MessageCircle,
    url: "/seo-product-name",
  },
  {
    title: "SEO mô tả sản phẩm Shopee",
    icon: FileText,
    url: "/seo-product-description",
  },
  {
    title: "Hỏi đáp chiến thuật",
    icon: MessageCircle,
    url: "/tactic-chatbot",
  },
];

export const SidebarChatMenu = React.memo(() => {
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
        id="chat-ai-label"
      >
        CHAT AI
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu 
          className="space-y-0" 
          role="navigation" 
          aria-labelledby="chat-ai-label"
        >
          {chatMenuItems.map((item) => (
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

SidebarChatMenu.displayName = "SidebarChatMenu";
