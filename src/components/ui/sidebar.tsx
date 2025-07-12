"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextType {
  state: SidebarState;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SidebarState>("expanded");

  const toggle = React.useCallback(() => {
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  }, []);

  return (
    <SidebarContext.Provider value={{ state, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { state } = useSidebar();
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        state === "expanded" ? "w-64" : "w-16", // Điều chỉnh chiều rộng dựa trên trạng thái
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({ className, children, ...props }: SidebarInsetProps) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "transition-all duration-300",
        state === "expanded" ? "ml-64" : "ml-16", // Điều chỉnh lề trái dựa trên trạng thái
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { state, toggle } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-8 w-8", className)}
      {...props}
    >
      {state === "expanded" ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4",
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
        "flex-1 overflow-y-auto p-2 space-y-0.5", // Giữ space-y-0.5 để các nhóm menu có khoảng cách
        className
      )}
      {...props}
    />
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return <div className={cn("mb-4", className)} {...props} />;
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function SidebarGroupLabel({ className, ...props }: SidebarGroupLabelProps) {
  return (
    <h3
      className={cn(
        "px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
        className
      )}
      {...props}
    />
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return <nav className={cn("space-y-1", className)} {...props} />;
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return <div className={cn("", className)} {...props} />;
}

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean;
  tooltip?: string;
}

export function SidebarMenuButton({
  isActive,
  tooltip,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { state } = useSidebar();
  const buttonContent = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );

  if (state === "collapsed" && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-sidebar-border p-4",
        className
      )}
      {...props}
    />
  );
}