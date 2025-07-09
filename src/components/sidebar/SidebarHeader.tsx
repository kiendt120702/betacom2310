import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarHeader as SidebarHeaderBase, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SidebarHeader() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();

  return (
    <SidebarHeaderBase className="border-b border-sidebar-border p-6 relative">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
          alt="Betacom Logo"
          className="h-8 w-auto flex-shrink-0"
        />
        {state === 'expanded' && (
          <span className="font-bold text-xl text-sidebar-foreground tracking-tight">Betacom</span>
        )}
      </div>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background border border-border rounded-full shadow-md hover:bg-accent hover:text-accent-foreground hidden md:flex" // Hidden on mobile
      >
        {state === 'expanded' ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </SidebarHeaderBase>
  );
}