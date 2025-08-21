import React, { memo, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils"; // Import cn utility

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = memo(function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { state: sidebarState } = useSidebar();

  const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen]);

  // Kiểm tra nếu đang ở môi trường staging
  const isStaging = import.meta.env.VITE_APP_ENV === 'staging';

  // Tính toán padding top dựa trên môi trường và trạng thái mobile
  // Tăng giá trị padding để đảm bảo không bị che khuất
  const topPaddingClass = isStaging ? 'pt-16' : 'pt-4'; // Tăng từ pt-8 lên pt-16 cho desktop
  const mobileTopPaddingClass = isStaging ? 'pt-28' : 'pt-16'; // Tăng từ pt-24 lên pt-28 cho mobile

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
            <span className="text-sm font-semibold text-primary">Betacom</span>
          </div>
        </header>
      )}

      <AppSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "flex-1 bg-background overflow-y-auto transition-all duration-300",
        isMobile ? mobileTopPaddingClass : topPaddingClass, // Áp dụng padding động
        isMobile ? "ml-0" : (sidebarState === 'collapsed' ? "ml-20" : "ml-56"),
        "p-4" // Giữ p-4 để có padding ngang và dưới
      )}>
        {children}
      </main>
    </div>
  );
});