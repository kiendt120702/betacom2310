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
      <div className="flex min-h-screen"> {/* This div will contain sidebar and main content side-by-side */}
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col"> {/* SidebarInset now also a flex-col to stack header and main content */}
          <AppHeader /> {/* Header for the main content area */}
          <main className="flex-1 p-6 bg-background overflow-y-auto"> {/* Main content, takes remaining vertical space and handles its own scrolling */}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}