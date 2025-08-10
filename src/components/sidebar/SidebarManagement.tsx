
import React from "react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Users, User, GraduationCap, BarChart3 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const SidebarManagement = () => {
  const { data: userProfile } = useUserProfile();

  if (!userProfile) return null;

  const isAdmin = userProfile.role === "admin";
  const isLeader = userProfile.role === "leader";
  const isChuyenVien = userProfile.role === "chuyên viên";

  // Chuyên viên chỉ thấy My Profile
  const menuItems = isChuyenVien
    ? [
        {
          title: "Hồ sơ của tôi",
          url: "/management#my-profile",
          icon: User,
        },
      ]
    : [
        ...(isAdmin || isLeader
          ? [
              {
                title: "Quản lý người dùng",
                url: "/management#users",
                icon: Users,
              },
            ]
          : []),
        {
          title: "Hồ sơ của tôi",
          url: "/management#my-profile",
          icon: User,
        },
        ...(isAdmin
          ? [
              {
                title: "Quản lý đào tạo",
                url: "/management#training-management",
                icon: GraduationCap,
              },
              {
                title: "Phân tích Video",
                url: "/management#video-analytics",
                icon: BarChart3,
              },
            ]
          : []),
      ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarManagement;
