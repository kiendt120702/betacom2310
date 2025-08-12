
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 p-6 bg-background overflow-y-auto ml-64">
        {children}
      </main>
    </div>
  );
}
