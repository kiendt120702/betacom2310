import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Eye, Loader2 } from "lucide-react";

const LeaderViewDashboard: React.FC = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const isLoading = profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== "leader") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground">Bạn không có quyền xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          Leader View
        </h1>
        <p className="text-muted-foreground mt-2">
          Chức năng tổng quan hiệu suất đã được gỡ bỏ. Bạn vẫn có thể quản lý nhân sự từ trang này.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý nhân sự</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vui lòng sử dụng tab &ldquo;Quản lý nhân sự&rdquo; để xem và thao tác với đội ngũ của bạn.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderViewDashboard;
