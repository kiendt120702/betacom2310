import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Library } from "lucide-react";

const GeneralTrainingManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="h-5 w-5" />
          Quản lý Đào tạo Chung
        </CardTitle>
        <CardDescription>
          Quản lý các bài học và tài liệu đào tạo chung cho toàn công ty (ví dụ: quy định, văn hóa doanh nghiệp).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Chức năng này đang được phát triển.</p>
          <p className="text-sm mt-2">
            Để một bài học xuất hiện ở đây, hãy đảm bảo bài học đó không có phân quyền theo vai trò hoặc phòng ban cụ thể trong mục 'Edu Shopee'.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralTrainingManagement;