import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn for conditional classnames

export function SidebarHeader() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();

  return (
    <SidebarHeaderBase className="p-4">
      <div className="flex items-center justify-between h-12">
        {state === 'expanded' && ( // Conditionally render this div
          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate('/')}>
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Betacom Logo"
              className="h-8 w-auto flex-shrink-0"
            />
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              Betacom
            </span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            state === "collapsed" && "mx-auto" // Center button when collapsed
          )}
        >
          {state === 'expanded' ? (
            <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </div>
    </SidebarHeaderBase>
  );
}