import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// --- Context for Sidebar State ---
type SidebarState = 'expanded' | 'collapsed';

type SidebarContextType = {
  state: SidebarState;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SidebarState>('expanded'); // Default to expanded

  const toggleSidebar = () => {
    setState((prevState) => (prevState === 'expanded' ? 'collapsed' : 'expanded'));
  };

  return (
    <SidebarContext.Provider value={{ state, toggleSidebar }}>
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

// --- Sidebar Components ---

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { state } = useSidebar();
  return (
    <aside
      className={cn(
        "flex-shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-300 ease-in-out",
        state === 'expanded' ? 'w-64' : 'w-20', // Expanded: 256px, Collapsed: 80px
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SidebarInset({ className, children, ...props }: SidebarInsetProps) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        state === 'expanded' ? 'ml-64' : 'ml-20', // Adjust margin-left based on sidebar width
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { state } = useSidebar();
  return (
    <h3 className={cn(
      "text-xs font-semibold text-gray-500 uppercase tracking-wider",
      state === 'collapsed' && 'sr-only', // Hide label when collapsed
      className
    )} {...props} />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarMenuButton({ className, children, isActive, ...props }: { isActive?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { state } = useSidebar();
  return (
    <button
      className={cn(
        "flex items-center w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200",
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        state === 'collapsed' && 'justify-center px-0', // Center icon when collapsed
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}