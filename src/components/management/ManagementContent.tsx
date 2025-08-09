
import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import UserManagement from "@/components/admin/UserManagement";
import TeamManagement from "@/pages/admin/TeamManagement";
import MyProfilePage from "@/pages/MyProfilePage";
import TrainingManagement from "@/components/admin/TrainingManagement";

interface ManagementContentProps {
  activeTab: string;
}

const ManagementContent: React.FC<ManagementContentProps> = ({ activeTab }) => {
  const { data: userProfile } = useUserProfile();

  const isAdmin = userProfile?.role === "admin";
  const isLeader = userProfile?.role === "leader";
  const isChuyenVien = userProfile?.role === "chuyên viên";

  // Chuyen vien can only see My Profile
  if (isChuyenVien) {
    return <MyProfilePage />;
  }

  switch (activeTab) {
    case "users":
      return isAdmin || isLeader ? <UserManagement /> : null;
    case "my-profile":
      return <MyProfilePage />;
    case "teams":
      return isAdmin ? <TeamManagement /> : null;
    case "training-management":
      return isAdmin ? <TrainingManagement /> : null;
    default:
      // Fallback for when activeTab is not set or invalid for the role
      if (isAdmin) return <MyProfilePage />; // Admin default to My Profile
      if (isLeader) return <UserManagement />; // Leader default to User Management
      return <MyProfilePage />; // Fallback for other roles
  }
};

export default ManagementContent;
