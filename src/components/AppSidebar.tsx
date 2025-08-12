
import React from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import SidebarManagement from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";

export function AppSidebar() {
  return (
    <div className="fixed left-0 top-0 w-64 bg-card border-r border-border flex flex-col h-screen z-40">
      {/* Header */}
      <div className="border-b border-border">
        <SidebarHeader />
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarNavigation />
        
        {/* Education Menu */}
        <div className="pt-4">
          <SidebarEduMenu />
        </div>
        
        {/* Chat AI Menu */}
        <div className="pt-4">
          <SidebarChatMenu />
        </div>
        
        {/* Management Menu */}
        <div className="pt-4">
          <SidebarManagement />
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border mt-auto">
        <SidebarFooter />
      </div>
    </div>
  );
}
