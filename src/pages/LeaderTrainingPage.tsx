import React from "react";
import LeaderTrainingVideoManagement from "@/components/admin/LeaderTrainingVideoManagement";

const LeaderTrainingPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Đào tạo Leader</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý video và nội dung đào tạo dành cho các vị trí lãnh đạo
        </p>
      </div>
      <LeaderTrainingVideoManagement />
    </div>
  );
};

export default LeaderTrainingPage;