import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Search, 
  Upload, 
  Star,
  Target,
  Grid3X3
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const navigationItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, path: '/' },
    { id: 'strategy-hub', label: 'Strategy Hub', icon: Target, path: '/strategy-hub' },
    { id: 'custom-strategies', label: 'Chiến lược tùy chỉnh', icon: Grid3X3, path: '/custom-strategies' },
    // Removed duplicate chat items
    { id: 'thumbnail', label: 'Thumbnail', icon: Upload, path: '/thumbnail' },
    { id: 'average-rating', label: 'Tính Điểm TB', icon: Star, path: '/average-rating' },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        NAVIGATION
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {state === 'expanded' && <span className="ml-3 truncate">{item.label}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}