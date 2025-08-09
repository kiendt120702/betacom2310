
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import { SidebarManagement } from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader />
      <SidebarContent className="px-2 py-0">
        <div className="flex flex-col gap-2">
          <SidebarNavigation />
          <SidebarChatMenu />
          <SidebarEduMenu />
          <SidebarManagement />
        </div>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
