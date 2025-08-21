import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import { Loader2 } from "lucide-react";

const LeaderPersonnelManagement: React.FC = () => {
  const { data: userProfile, isLoading } = useUserProfile();

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

  // Chỉ admin hoặc leader mới có thể truy cập trang này
  if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "leader")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-4 md:p-6">
      <AdminUserManagement />
    </div>
  );
};

export default LeaderPersonnelManagement;