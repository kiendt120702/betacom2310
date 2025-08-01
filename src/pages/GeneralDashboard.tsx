import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GeneralDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trang chủ</h1>
          <p className="text-muted-foreground mt-2">
            Chào mừng bạn đã quay trở lại.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chào mừng</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nội dung trang chủ sẽ được cập nhật sớm.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralDashboard;
