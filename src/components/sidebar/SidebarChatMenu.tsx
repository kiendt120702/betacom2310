import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Search, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  SidebarGroup,
  SidebarContent, // Changed from SidebarGroupContent
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const chatMenuItems = [
  {
    title: "Tư vấn AI",
    url: "/chatbot",
    icon: MessageCircle,
  },
  {
    title: "SEO Shopee",
    url: "/seo-chatbot",
    icon: Search,
  },
  {
    title: "Hỏi đáp chung",
    url: "/general-chatbot",
    icon: HelpCircle,
  },
];

export function SidebarChatMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <SidebarGroup className="mb-6">
      <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        CHAT AI
      </SidebarGroupLabel>
      <SidebarContent>
        <SidebarMenu className="space-y-1">
          {chatMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive(item.url)}
                onClick={() => navigate(item.url)}
                className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {state === 'expanded' && <span className="ml-3 truncate">{item.title}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </SidebarGroup>
  );
}