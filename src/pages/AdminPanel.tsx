import React, { useState, lazy, Suspense } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminThumbnailManagement from "@/components/admin/AdminThumbnailManagement";
import TrainingManagement from "@/components/admin/TrainingManagement";
import LearningProgressDashboard from "@/components/admin/LearningProgressDashboard";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import LeaderTrainingManagement from "@/components/admin/LeaderTrainingManagement";
import SpecialistTrainingManagement from "@/components/admin/SpecialistTrainingManagement";
import GeneralTrainingManagement from "@/components/admin/GeneralTrainingManagement";
import WebsiteTrafficDashboard from "@/components/admin/WebsiteTrafficDashboard";
import LeaderViewDashboard from "@/components/admin/LeaderViewDashboard";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PermissionManagementPage from "@/components/admin/PermissionManagementPage"; // Import new page

const EssaySubmissionReviewPage = lazy(() => import("./admin/EssaySubmissionReviewPage"));

const AdminPanel = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const [activeSection, setActiveSection] = useState("users");
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      case "permissions":
        return <PermissionManagementPage />;
      case "training":
        return <TrainingManagement />;
      case "learning-progress":
        return <LearningProgressDashboard />;
      case "thumbnails":
        return <AdminThumbnailManagement />;
      case "feedback":
        return <FeedbackManagement />;
      case "leader-training-management":
        return <LeaderTrainingManagement />;
      case "specialist-training-management":
        return <SpecialistTrainingManagement />;
      case "general-training-management":
        return <GeneralTrainingManagement />;
      case "traffic-website-dashboard":
        return <WebsiteTrafficDashboard />;
      case "leader-view": // New case for Leader View
        return <LeaderViewDashboard />;
      case "essay-grading":
        return (
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <EssaySubmissionReviewPage />
          </Suspense>
        );
      default:
        return <AdminUserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isMobile ? "ml-0" : (isSidebarCollapsed ? "ml-20" : "ml-56")
      }`}>
        <div className={`p-4 ${isMobile ? "pt-16" : "p-6"}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;