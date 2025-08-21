import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

const SpecialistTrainingManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Quản lý đào tạo Chuyên viên
        </CardTitle>
        <CardDescription>
          Đây là nơi quản lý các bài học và tài liệu đào tạo dành riêng cho vai trò Chuyên viên.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Chức năng này đang được phát triển.</p>
          <p className="text-sm mt-2">Bạn có thể thêm các bài học và phân quyền cho Chuyên viên tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecialistTrainingManagement;