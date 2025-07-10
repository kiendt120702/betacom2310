import React from 'react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarChatMenu } from '@/components/sidebar/SidebarChatMenu';
import { SidebarManagement } from '@/components/sidebar/SidebarManagement';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader />
      
      <SidebarContent className="px-1.5 space-y-1"> {/* Changed p-1.5 to px-1.5 and added space-y-1 */}
        <SidebarNavigation />
        <SidebarChatMenu />
        <SidebarManagement />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}