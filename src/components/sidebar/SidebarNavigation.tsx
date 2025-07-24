
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Home, MessageCircle, FileText, TrendingUp, FileSpreadsheet, Target } from 'lucide-react';

const SidebarNavigation: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Trang chủ',
      url: '/',
      icon: Home,
    },
    {
      title: 'Đăng bán nhanh',
      url: '/quick-product-post',
      icon: FileText,
    },
    {
      title: 'Shopee Strategy Hub',
      url: '/strategy-hub',
      icon: Target,
    },
    {
      title: 'Quản lý chiến lược',
      url: '/strategy-management',
      icon: FileSpreadsheet,
    },
    {
      title: 'Tỷ lệ đánh giá trung bình',
      url: '/average-rating',
      icon: TrendingUp,
    },
    {
      title: 'Thư viện Banner',
      url: '/banner-gallery',
      icon: FileText,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                isActive={location.pathname === item.url}
              >
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export { SidebarNavigation };
