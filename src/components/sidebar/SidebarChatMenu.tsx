
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Search, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
    <SidebarGroup className="mb-8">
      <Collapsible defaultOpen>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full h-12 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              {state === 'expanded' && (
                <>
                  <span className="ml-3 flex-1 text-left">CHAT AI</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </>
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <SidebarMenuSub className="ml-4 space-y-1">
              {chatMenuItems.map((item) => (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    className={`w-full h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.url)
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {state === 'expanded' && <span className="ml-3 truncate">{item.title}</span>}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarGroup>
  );
}
