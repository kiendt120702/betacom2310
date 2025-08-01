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
    <SidebarHeaderBase className="p-4">
      <div className="flex items-center h-12">
        {" "}
        {/* Removed justify-between */}
        {state === "expanded" && (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Betacom Logo"
              className="h-8 w-auto flex-shrink-0"
            />
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              Betacom
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-10 w-10 sm:h-8 sm:w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-auto touch-manipulation",
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
