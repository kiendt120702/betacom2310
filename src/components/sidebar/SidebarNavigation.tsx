import React from "react";
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Activity,
  FileText,
  Power,
  LogOut,
  ListChecks,
  KanbanSquare,
  BadgeCheck,
  LucideIcon,
  TrendingUp
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleBannersClick = () => {
    navigate("/banners");
  };

  const handleCategoriesClick = () => {
    navigate("/categories");
  };

  const handleUsersClick = () => {
    navigate("/users");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    navigate("/logout");
  };

  const handleTrainingClick = () => {
    navigate("/training");
  };

  const handleAssignmentsClick = () => {
    navigate("/assignments");
  };

  const handleComprehensiveReportsClick = () => {
    navigate("/reports");
  };

  const handleShopRevenueClick = () => {
    navigate("/shop-revenue");
  };

  const handleSeoChatClick = () => {
    navigate("/seo-chat");
  };

  const handleDoanhSoClick = () => {
    navigate("/doanh-so");
  };

  return (
    <nav className="space-y-1 p-4">
      <button
        onClick={handleDashboardClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/dashboard'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mr-3" />
        Tổng quan
      </button>

      <button
        onClick={handleBannersClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/banners'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Home className="w-5 h-5 mr-3" />
        Banners
      </button>

      <button
        onClick={handleCategoriesClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/categories'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <ListChecks className="w-5 h-5 mr-3" />
        Categories
      </button>

      <button
        onClick={handleUsersClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/users'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Users className="w-5 h-5 mr-3" />
        Users
      </button>

      <button
        onClick={handleTrainingClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/training'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <BadgeCheck className="w-5 h-5 mr-3" />
        Training
      </button>

      <button
        onClick={handleAssignmentsClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/assignments'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <KanbanSquare className="w-5 h-5 mr-3" />
        Assignments
      </button>

      <button
        onClick={handleComprehensiveReportsClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/reports'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <FileText className="w-5 h-5 mr-3" />
        Báo cáo
      </button>

      <button
        onClick={handleShopRevenueClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/shop-revenue'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Activity className="w-5 h-5 mr-3" />
        Doanh số cửa hàng
      </button>

      <button
        onClick={handleSeoChatClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/seo-chat'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Activity className="w-5 h-5 mr-3" />
        SEO Chat
      </button>
      
      <button
        onClick={handleDoanhSoClick}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          location.pathname === '/doanh-so'
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <TrendingUp className="w-5 h-5 mr-3" />
        Doanh Số
      </button>
    </nav>
  );
};
