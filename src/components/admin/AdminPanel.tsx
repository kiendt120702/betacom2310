import React, { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminThumbnailManagement from "@/components/admin/AdminThumbnailManagement";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import TrainingManagement from "@/components/admin/TrainingManagement";
import LearningProgressDashboard from "@/components/admin/LearningProgressDashboard";
import { Loader2 } from "lucide-react";

const AdminPanel = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const [activeSection, setActiveSection] = useState("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chỉ admin mới có thể truy cập admin panel
  if (!userProfile || userProfile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <AdminUserManagement />;
      case "training":
        return <TrainingManagement />;
      case "learning-progress":
        return <LearningProgressDashboard />;
      case "banners":
        return <AdminThumbnailManagement />;
      case "analytics":
        return <AdminAnalytics />;
      case "settings":
        return <AdminSystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;