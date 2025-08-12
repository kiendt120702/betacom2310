import React from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import SidebarManagement from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";

export function AppSidebar() {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Header với styling tương tự AdminSidebar */}
      <div className="border-b border-border">
        <SidebarHeader />
      </div>

      {/* Navigation Content với spacing và scroll tốt hơn */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarNavigation />
        
        {/* Separator cho Education */}
        <div className="pt-6">
          <SidebarEduMenu />
        </div>
        
        {/* Separator cho Chat AI */}
        <div className="pt-6">
          <SidebarChatMenu />
        </div>
        
        {/* Separator cho Management */}
        <div className="pt-6">
          <SidebarManagement />
        </div>
      </nav>

      {/* Footer với border top tương tự AdminSidebar */}
      <div className="border-t border-border mt-auto">
        <SidebarFooter />
      </div>
    </div>
  );
}