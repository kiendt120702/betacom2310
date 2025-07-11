import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader'; // Import AppHeader

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen"> {/* Changed to flex-col for header on top */}
        <AppHeader /> {/* Add the header here */}
        <div className="flex flex-1"> {/* This div will contain sidebar and main content */}
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-auto"> {/* Ensure content scrolls within its area */}
            <main className="flex-1 p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}