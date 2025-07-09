"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Ensure Button is imported

interface SidebarProviderProps {
  children: React.ReactNode;
}

type SidebarContextType = {
  state: 'expanded' | 'collapsed';
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children, ...props }: SidebarProviderProps) {
  const [state, setState] = useState<'expanded' | 'collapsed'>(() => {
    // Read from local storage or default to 'expanded'
    const savedState = localStorage.getItem('sidebarState');
    return savedState === 'collapsed' ? 'collapsed' : 'expanded';
  });

  const toggleSidebar = useCallback(() => {
    setState(prevState => {
      const newState = prevState === 'expanded' ? 'collapsed' : 'expanded';
      localStorage.setItem('sidebarState', newState);
      return newState;
    });
  }, []);

  const value = useMemo(() => ({
    state,
    toggleSidebar,
  }), [state, toggleSidebar]);

  return (
    <SidebarContext.Provider {...props} value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { state } = useSidebar();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar-background transition-all duration-300 ease-in-out",
        state === 'expanded' ? 'w-64' : 'w-20', // Dynamic width
        className
      )}
      {...props}
    />
  );
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        state === 'expanded' ? 'ml-64' : 'ml-20', // Dynamic margin
        className
      )}
      {...props}
    />
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between h-16 px-4", // Default padding
        className
      )}
      {...props}
    />
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        className
      )}
      {...props}
    />
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0",
        className
      )}
      {...props}
    />
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        className
      )}
      {...props}
    />
  );
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({ className, ...props }: SidebarGroupLabelProps) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
        state === 'expanded' ? 'px-3' : 'text-center px-0', // Adjust padding and text alignment
        className
      )}
      {...props}
    />
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <nav
      className={cn(
        "space-y-1",
        className
      )}
      {...props}
    />
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <div
      className={cn(
        className
      )}
      {...props}
    />
  );
}

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean;
}

export function SidebarMenuButton({ className, isActive, children, ...props }: SidebarMenuButtonProps) {
  const { state } = useSidebar();
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-10 text-sm font-medium rounded-lg transition-all duration-200",
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        state === 'expanded' ? 'justify-start px-4' : 'justify-center px-0', // Adjust padding and justify
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}