
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarHeader() {
  const navigate = useNavigate();
  const { state } = useSidebar();

  return (
    <SidebarHeaderBase className="border-b border-sidebar-border p-6">
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
    </SidebarHeaderBase>
  );
}
