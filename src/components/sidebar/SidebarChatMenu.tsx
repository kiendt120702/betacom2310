import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Import Badge component

const chatMenuItems = [
  {
    title: "ChatGPT", // Đổi tên
    icon: Bot, // Giữ nguyên icon Bot
    url: "/gpt4o-mini",
    tag: "Hot", // Thêm tag Hot
  },
  {
    title: "SEO tên sản phẩm Shopee",
    icon: MessageCircle,
    url: "/seo-product-name",
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
    <div className="space-y-1">
      {/* Section Label với khoảng cách nhỏ hơn */}
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        CHAT AI
      </h3>
      
      {/* Chat AI Items với Button spacing nhỏ hơn */}
      {chatMenuItems.map((item) => {
        const Icon = item.icon;
        const itemActive = isActive(item.url);
        
        return (
          <Button
            key={item.title}
            variant={itemActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10", // Giảm từ h-12 xuống h-10
              itemActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.url)}
          >
            <Icon className="w-4 h-4" /> {/* Giảm từ w-5 h-5 xuống w-4 h-4 */}
            <span className="font-medium">{item.title}</span>
            {item.tag === "Hot" && (
              <Badge variant="destructive" className="ml-auto text-xs px-2 py-0.5">
                Hot
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarChatMenu.displayName = "SidebarChatMenu";