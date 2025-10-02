import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Store, Loader2, Eye } from "lucide-react";
import ShopPerformance from "@/components/dashboard/ShopPerformance";

const LeaderViewDashboard: React.FC = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const currentMonth = format(new Date(), "yyyy-MM");

  // Fetch comprehensive reports filtered by the current leader's ID
  const { data: comprehensiveReports, isLoading: reportsLoading } = useComprehensiveReports({
    month: currentMonth,
    leaderId: userProfile?.id,
  });

  const isLoading = profileLoading || reportsLoading;

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
          Dashboard Leader
        </h1>
        <p className="text-muted-foreground mt-2">
          Chào mừng, {userProfile.full_name || userProfile.email}! Theo dõi hiệu suất team của bạn trong tháng {format(new Date(), "MMMM yyyy", { locale: vi })}.
        </p>
      </div>

      {/* Shop Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Hiệu suất Shop của bạn
          </CardTitle>
          <CardDescription>
            Tổng quan về doanh số và hiệu suất của các shop dưới sự quản lý của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShopPerformance reports={comprehensiveReports || []} isLoading={reportsLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderViewDashboard;