"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Context for sidebar state
interface SidebarContextType {
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultState?: "expanded" | "collapsed";
}

export function SidebarProvider({
  children,
  defaultState = "expanded",
}: SidebarProviderProps) {
  const [state, setState] = React.useState<"expanded" | "collapsed">(defaultState);

  const toggleSidebar = React.useCallback(() => {
    setState((prevState) => (prevState === "expanded" ? "collapsed" : "expanded"));
  }, []);

  const value = React.useMemo(() => ({ state, toggleSidebar }), [state, toggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

// Sidebar components
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar();
    return (
      <aside
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-sidebar-background transition-all duration-300 ease-in-out",
          state === "expanded" ? "w-64" : "w-[80px]", // Adjusted width for collapsed state
          "overflow-y-auto scrollbar-hide", // Ensure scrollable and hide scrollbar
          className
        )}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = "SidebarHeader";

// Re-adding SidebarContent
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  )
);
SidebarContent.displayName = "SidebarContent";


interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  )
);
SidebarGroup.displayName = "SidebarGroup";

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SidebarGroupLabel = React.forwardRef<
  HTMLHeadingElement,
  SidebarGroupLabelProps
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  if (state === "collapsed") return null; // Hide label when collapsed
  return (
    <h3
      ref={ref}
      className={cn("text-xs font-semibold uppercase tracking-wider", className)}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn("space-y-1", className)} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenuItem = React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, ...props }, ref) => {
  const { state } = useSidebar(); // Get state here
  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center h-10 rounded-lg text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        // Conditional classes based on state
        state === "expanded"
          ? "w-full px-4 justify-start gap-3"
          : "w-full justify-center px-0", // Keep w-full, but center content and remove horizontal padding
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => {
    const { state } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          state === "expanded" ? "ml-64" : "ml-[80px]", // Adjusted margin for collapsed state
          className
        )}
        {...props}
      />
    );
  }
);
SidebarInset.displayName = "SidebarInset";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
};