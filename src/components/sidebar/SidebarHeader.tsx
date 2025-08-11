import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarHeader as SidebarHeaderBase } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarHeader() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();

  return (
    <SidebarHeaderBase className="p-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar-primary/5 to-transparent">
      <div className="flex items-center justify-between h-12">
        {state === "expanded" && (
          <div
            className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:scale-105"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <img
                src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
                alt="Betacom Logo"
                className="h-8 w-auto flex-shrink-0 transition-all duration-200 group-hover:drop-shadow-sm"
              />
              <span className="font-bold text-lg text-sidebar-foreground tracking-tight bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text">
                Betacom
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-10 w-10 sm:h-8 sm:w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground touch-manipulation transition-all duration-200 hover:scale-110 active:scale-95 rounded-xl",
            state === "collapsed" && "ml-auto" // Chỉ thêm ml-auto khi sidebar thu gọn
          )}
          aria-label={state === "expanded" ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          title={state === "expanded" ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {state === "expanded" ? (
            <ChevronLeft className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" aria-hidden="true" />
          )}
        </Button>
      </div>
    </SidebarHeaderBase>
  );
}