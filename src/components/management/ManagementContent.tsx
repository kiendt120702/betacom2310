
import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import MyProfilePage from "@/pages/MyProfilePage";

interface ManagementContentProps {
  activeTab: string;
}

const ManagementContent: React.FC<ManagementContentProps> = ({ activeTab }) => {
  const { data: userProfile } = useUserProfile();

  // Tất cả các tab hiện tại đều dẫn đến My Profile vì đã chuyển sang Admin Panel
  return <MyProfilePage />;
};

export default ManagementContent;
