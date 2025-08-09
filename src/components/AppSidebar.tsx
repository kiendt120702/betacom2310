
import React from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarChatMenu } from "./sidebar/SidebarChatMenu";
import { SidebarEduMenu } from "./sidebar/SidebarEduMenu";
import { SidebarManagement } from "./sidebar/SidebarManagement";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent className="flex flex-col gap-0">
        <SidebarNavigation />
        <SidebarChatMenu />
        <SidebarEduMenu />
        <SidebarManagement />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
