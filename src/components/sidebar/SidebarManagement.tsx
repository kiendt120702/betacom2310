import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Users, Brain, Search, Package, BarChart2, Users2, User as UserIcon } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

  // Determine active tab based on URL hash
  const activeTab = location.hash.replace('#', '');

  const managementMenuItems = useMemo(() => {
    const items = [
      { id: 'dashboard', label: 'Thống kê', icon: BarChart2, roles: ['admin'] },
      { id: 'my-profile', label: 'Hồ sơ của tôi', icon: UserIcon, roles: ['admin', 'leader', 'chuyên viên'] },
      { id: 'users', label: 'Quản lý User', icon: Users, roles: ['admin', 'leader'] },
      { id: 'teams', label: 'Quản lý Team', icon: Users2, roles: ['admin'] },
      { id: 'product-categories', label: 'Quản lý Ngành hàng', icon: Package, roles: ['admin'] },
      { id: 'knowledge', label: 'Knowledge Base', icon: Brain, roles: ['admin'] },
      { id: 'seo-knowledge', label: 'Kiến thức SEO', icon: Search, roles: ['admin'] },
    ];

    // Filter items based on user's role
    return items.filter(item => item.roles.includes(userProfile?.role as any));
  }, [userProfile]);

  // Only render the management section if the user has access to at least one item
  if (!isAdmin && !isLeader && !isChuyenVien) return null;

  return (
    <SidebarGroup className="mb-0"> {/* Changed from mb-2 to mb-0 */}
      <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        SETTING
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0">
          {managementMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={activeTab === item.id}
                onClick={() => navigate(`/management#${item.id}`)}
                className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
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