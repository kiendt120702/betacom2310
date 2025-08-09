
import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon: Icon,
  label,
  isActive = false,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

export default SidebarMenuItem;
