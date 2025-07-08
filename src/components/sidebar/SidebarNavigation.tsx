
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Package } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainMenuItems = [
  {
    title: "Thumbnail",
    url: "/thumbnail",
    icon: LayoutGrid,
  },
  {
    title: "Đăng nhanh SP",
    url: "/quick-post",
    icon: Package,
  },
];

export function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarGroup className="mb-4">
      <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        CHÍNH
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                onClick={() => navigate(item.url)}
                className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {state === 'expanded' && <span className="ml-3 truncate">{item.title}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
