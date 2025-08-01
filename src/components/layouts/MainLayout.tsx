import React from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
