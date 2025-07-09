"use client";

import React from 'react';
import { Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarChatMenu } from '@/components/sidebar/SidebarChatMenu';
import { SidebarManagement } from '@/components/sidebar/SidebarManagement';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar className="border-r bg-white relative">
      <SidebarHeader />
      
      <SidebarContent className="p-3">
        <SidebarNavigation />
        <SidebarChatMenu />
        <SidebarManagement />
      </SidebarContent>

      <SidebarFooter />

      {/* Collapse/Expand Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 rounded-full w-8 h-8 bg-background border border-border shadow-md hover:bg-accent hover:border-accent-foreground z-50"
      >
        {state === 'expanded' ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </Sidebar>
  );
}