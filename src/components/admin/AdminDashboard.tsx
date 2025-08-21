import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan Admin</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi hoạt động của hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chào mừng Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Đây là trang tổng quan. Các thống kê đã được gỡ bỏ theo yêu cầu.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;