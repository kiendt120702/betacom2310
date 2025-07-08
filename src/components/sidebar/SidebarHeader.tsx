import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Import Button
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons

export function SidebarHeader() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar(); // Get state and toggleSidebar from hook

  return (
    <SidebarHeaderBase className="border-b border-gray-100 p-6 relative"> {/* Added relative for positioning */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
          alt="Betacom Logo"
          className="h-8 w-auto flex-shrink-0"
        />
        {state === 'expanded' && (
          <span className="font-bold text-xl text-gray-900 tracking-tight">Betacom</span>
        )}
      </div>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        {state === 'expanded' ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </Button>
    </SidebarHeaderBase>
  );
}