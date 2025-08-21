import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useLearningAnalytics } from "@/hooks/useLearningAnalytics";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Users, BookOpen, Store, Loader2, Eye } from "lucide-react";
import LearningProgressDashboard from "./LearningProgressDashboard";
import ShopPerformance from "@/components/dashboard/ShopPerformance";

const LeaderViewDashboard: React.FC = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const currentMonth = format(new Date(), "yyyy-MM");

  // Fetch comprehensive reports filtered by the current leader's ID
  const { data: comprehensiveReports, isLoading: reportsLoading } = useComprehensiveReports({
    month: currentMonth,
    leaderId: userProfile?.id,
  });

  // Learning analytics data is fetched without specific leaderId,
  // as LearningProgressDashboard handles filtering by current user's team.
  const { data: learningAnalytics, isLoading: learningLoading } = useLearningAnalytics();

  const isLoading = profileLoading || reportsLoading || learningLoading;

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
          Tổng quan Leader
        </h1>
        <p className="text-muted-foreground mt-2">
          Chào mừng, {userProfile.full_name || userProfile.email}! Đây là tổng quan về hiệu suất team và shop của bạn trong tháng {format(new Date(), "MMMM yyyy", { locale: vi })}.
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

      {/* Learning Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tiến độ học tập của Team
          </CardTitle>
          <CardDescription>
            Theo dõi tiến độ học tập của các thành viên trong team của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* LearningProgressDashboard already handles filtering by current user's team */}
          <LearningProgressDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderViewDashboard;