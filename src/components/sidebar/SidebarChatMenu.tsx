import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

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
  {
    title: "GPT-4o Mini",
    icon: Bot,
    url: "/gpt4o-mini",
  },
];

export const SidebarChatMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = React.useCallback((path: string) => location.pathname === path, [location.pathname]);
  
  const handleNavigation = React.useCallback((url: string) => {
    navigate(url);
  }, [navigate]);

  // Only render if user is logged in and there are chat menu items
  if (!user || chatMenuItems.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Section Label tương tự AdminSidebar */}
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        CHAT AI
      </h3>
      
      {/* Chat AI Items với Button styling tương tự AdminSidebar */}
      {chatMenuItems.map((item) => {
        const Icon = item.icon;
        const itemActive = isActive(item.url);
        
        return (
          <Button
            key={item.title}
            variant={itemActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-12",
              itemActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.url)}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </Button>
        );
      })}
    </div>
  );
});

SidebarChatMenu.displayName = "SidebarChatMenu";