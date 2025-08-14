
import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile Header Bar */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-sm border-b border-border z-30 flex items-center px-4 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
            <span className="text-sm font-medium">Menu</span>
          </Button>
          
          <div className="flex items-center gap-2 ml-4">
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Betacom Logo"
              className="h-6 w-auto"
            />
            <span className="text-sm font-semibold">Betacom</span>
          </div>
        </header>
      )}

      <AppSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={`flex-1 p-4 bg-background overflow-y-auto transition-all duration-300 ${
        isMobile ? "ml-0 pt-16" : "ml-56"
      }`}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
