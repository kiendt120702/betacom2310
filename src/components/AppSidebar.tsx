import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarChatMenu } from './sidebar/SidebarChatMenu';
import { SidebarManagement } from './sidebar/SidebarManagement';
import { SidebarFooter } from './sidebar/SidebarFooter';

export function AppSidebar() {
  return (
    <Sidebar className="flex flex-col">
      <SidebarHeader />
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="py-2 space-y-4">
          <SidebarNavigation />
          <SidebarChatMenu />
          <SidebarManagement />
        </div>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}