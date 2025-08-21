import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { useSidebar } from "@/components/ui/sidebar";

const chatMenuItems = [
  {
    title: "ChatGPT", // Đổi tên
    icon: Bot, // Giữ nguyên icon Bot
    url: "/gpt4o-mini",
    tag: "Hot", // Thêm tag Hot
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

  // Only render if user is logged in and there are chat menu items
  if (!user || chatMenuItems.length === 0) return null;

  return (
    <div className="space-y-1">
      {state === 'expanded' && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          CHAT AI
        </h3>
      )}
      
      {/* Chat AI Items với Button spacing nhỏ hơn */}
      {chatMenuItems.map((item) => {
        const Icon = item.icon;
        const itemActive = isActive(item.url);
        
        return (
          <Button
            key={item.title}
            variant={itemActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === 'expanded' ? "justify-start" : "justify-center",
              itemActive && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => handleNavigation(item.url)}
          >
            <Icon className="w-4 h-4" />
            {state === 'expanded' && (
              <>
                <span className="font-medium">{item.title}</span>
                {item.tag === "Hot" && (
                  <Badge variant="destructive" className="ml-auto text-xs px-2 py-0.5">
                    Hot
                  </Badge>
                )}
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarChatMenu.displayName = "SidebarChatMenu";