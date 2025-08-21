import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Library } from "lucide-react";

const GeneralTrainingManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="h-5 w-5" />
          Quản lý đào tạo Chung
        </CardTitle>
        <CardDescription>
          Đây là nơi quản lý các bài học và tài liệu đào tạo chung cho tất cả người dùng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Chức năng này đang được phát triển.</p>
          <p className="text-sm mt-2">Bạn có thể thêm các bài học và phân quyền cho tất cả người dùng tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralTrainingManagement;