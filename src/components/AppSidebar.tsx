
import React, { useState } from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import SidebarManagement from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen = false, onToggle }: AppSidebarProps) {
  const isMobile = useIsMobile();

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
    <div className="fixed left-0 top-0 w-56 bg-card border-r border-border flex flex-col h-screen z-40">
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
      <div className="border-t border-border mt-auto">
        <SidebarFooter />
      </div>
    </div>
  );
}
