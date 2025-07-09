import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarChatMenu } from '@/components/sidebar/SidebarChatMenu';
import { SidebarManagement } from '@/components/sidebar/SidebarManagement';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';

export function AppSidebar() {
  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader />
      
      <SidebarContent className="p-3">
        <SidebarNavigation />
        <SidebarChatMenu />
        <SidebarManagement />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}