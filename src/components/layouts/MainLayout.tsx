
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className={`flex-1 p-4 bg-background overflow-y-auto transition-all duration-300 ${
        isMobile ? "ml-0" : "ml-64"
      }`}>
        {children}
      </main>
    </div>
  );
}
