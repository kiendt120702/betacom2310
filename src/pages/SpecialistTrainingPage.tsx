import React from "react";
import SpecialistTrainingVideoManagement from "@/components/admin/SpecialistTrainingVideoManagement";

const SpecialistTrainingPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Đào tạo Chuyên viên</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý video và nội dung đào tạo dành cho các chuyên viên kỹ thuật
        </p>
      </div>
      <SpecialistTrainingVideoManagement />
    </div>
  );
};

export default SpecialistTrainingPage;