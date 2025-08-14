
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

export function AppSidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background shadow-md"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed left-0 top-0 w-80 bg-card border-r border-border flex flex-col h-screen z-50 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="border-b border-border">
            <SidebarHeader />
          </div>

          {/* Navigation Content */}
          <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
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
    <div className="fixed left-0 top-0 w-64 bg-card border-r border-border flex flex-col h-screen z-40">
      {/* Header */}
      <div className="border-b border-border">
        <SidebarHeader />
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
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
