import React from "react";
import { useAuth } from "@/hooks/useAuth";
import GeneralTrainingVideoManagement from "@/components/admin/GeneralTrainingVideoManagement";
import GeneralTrainingLearningPage from "./GeneralTrainingLearningPage";
import { useUserProfile } from "@/hooks/useUserProfile";

const GeneralTrainingPage: React.FC = () => {
  const { data: profile } = useUserProfile();
  const isAdmin = profile?.role === 'admin';

  // Admin view - Management interface
  if (isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Quản lý Đào tạo Chung</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý video và nội dung đào tạo chung cho toàn bộ nhân viên
          </p>
        </div>
        <GeneralTrainingVideoManagement />
      </div>
    );
  }

  // Student view - Learning interface
  return <GeneralTrainingLearningPage />;
};

export default GeneralTrainingPage;