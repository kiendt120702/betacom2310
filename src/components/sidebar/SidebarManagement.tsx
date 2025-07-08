
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function SidebarManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

  const isActive = (path: string) => location.pathname === path;

  if (!isAdmin && !isLeader && !isChuyenVien) return null;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isActive('/management')}
              onClick={() => navigate('/management')}
              className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive('/management')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {state === 'expanded' && <span className="ml-3 truncate">Management</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
