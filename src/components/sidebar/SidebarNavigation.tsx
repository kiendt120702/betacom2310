
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Images, 
  Users, 
  Settings, 
  Target, 
  MessageSquareMore, 
  MessageSquare,
  BookOpen,
  GraduationCap,
  User,
  FileText,
  Star,
  Calculator,
  MapPin,
  CreditCard,
  Bot,
  Clock,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Trang chính",
      items: [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Thư viện Thumbnail", url: "/thumbnails", icon: Images },
      ]
    },
    {
      title: "Quản lý",
      items: [
        { title: "Admin Panel", url: "/admin", icon: Settings },
        { title: "Quản lý chung", url: "/management", icon: Users },
        { title: "Quản lý Chiến thuật", url: "/tactics", icon: Target },
      ]
    },
    {
      title: "Báo cáo",
      items: [
        { title: "Báo cáo tổng hợp", url: "/consolidated-report", icon: BarChart3 },
        { title: "Thống kê Doanh số", url: "/revenue-statistics", icon: TrendingUp },
      ]
    },
    {
      title: "AI Chatbot",
      items: [
        { title: "SEO Chatbot", url: "/seo-chatbot", icon: MessageSquareMore },
        { title: "Tactic Chatbot", url: "/tactic-chatbot", icon: MessageSquare },
        { title: "GPT-4o Mini", url: "/gpt4o-mini", icon: Bot },
      ]
    },
    {
      title: "Kiến thức",
      items: [
        { title: "SEO Knowledge", url: "/seo-knowledge", icon: BookOpen },
        { title: "Tạo mô tả SP", url: "/seo-product-description", icon: FileText },
      ]
    },
    {
      title: "Đào tạo",
      items: [
        { title: "Quá trình đào tạo", url: "/training-process", icon: GraduationCap },
        { title: "Nộp bài tập", url: "/assignment-submission", icon: FileText },
      ]
    },
    {
      title: "Shopee Tools",
      items: [
        { title: "Đánh giá TB", url: "/average-rating", icon: Star },
        { title: "Tính Fast Delivery", url: "/fast-delivery-calculation", icon: Calculator },
        { title: "Lý thuyết Fast Delivery", url: "/fast-delivery-theory", icon: MapPin },
        { title: "Phí Shopee", url: "/shopee-fees", icon: CreditCard },
      ]
    },
    {
      title: "Cá nhân",
      items: [
        { title: "Hồ sơ của tôi", url: "/my-profile", icon: User },
        { title: "Sắp ra mắt", url: "/coming-soon", icon: Clock },
      ]
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarNavigation;
