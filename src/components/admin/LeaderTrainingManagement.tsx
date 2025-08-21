import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Crown } from "lucide-react";

const LeaderTrainingManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Quản lý đào tạo Leader
        </CardTitle>
        <CardDescription>
          Đây là nơi quản lý các bài học và tài liệu đào tạo dành riêng cho vai trò Leader.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Chức năng này đang được phát triển.</p>
          <p className="text-sm mt-2">Bạn có thể thêm các bài học và phân quyền cho Leader tại đây.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderTrainingManagement;