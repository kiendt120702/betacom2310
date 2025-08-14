import React, { useState, memo } from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import SidebarManagement from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AppSidebar = memo(function AppSidebar({ isOpen = false, onToggle }: AppSidebarProps) {
  const isMobile = useIsMobile();
  const { state: sidebarState, toggle: toggleDesktopSidebar } = useSidebar();

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onToggle}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed left-0 top-0 w-72 bg-card border-r border-border flex flex-col h-screen z-50 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header with close button */}
          <div className="border-b border-border relative">
            <SidebarHeader />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Content */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            <SidebarNavigation />
            <SidebarEduMenu />
            <SidebarChatMenu />
            <SidebarManagement />
          </nav>

          {/* Footer */}
          <div className="border-t border-border mt-auto">
            <SidebarFooter />
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div
      className={cn(
        "fixed left-0 top-0 bg-card border-r border-border flex flex-col h-screen z-40 transition-all duration-300",
        sidebarState === "collapsed" ? "w-20" : "w-56",
      )}
    >
      {/* Header */}
      <div className="border-b border-border relative">
        <SidebarHeader />
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SidebarNavigation />
        <SidebarEduMenu />
        <SidebarChatMenu />
        <SidebarManagement />
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <SidebarFooter />
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full"
            onClick={toggleDesktopSidebar}
          >
            {sidebarState === "expanded" ? (
              <>
                <ChevronsLeft className="w-4 h-4 mr-2" />
                <span>Thu gọn</span>
              </>
            ) : (
              <ChevronsRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});