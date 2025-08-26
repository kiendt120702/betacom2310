import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useLearningAnalytics } from "@/hooks/useLearningAnalytics";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Users, BookOpen, Store, Loader2, Eye, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import LearningProgressDashboard from "./LearningProgressDashboard";
import ShopPerformance from "@/components/dashboard/ShopPerformance";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

  // Calculate team learning metrics
  const teamMetrics = useMemo(() => {
    if (!learningAnalytics?.users || !userProfile) return null;
    
    const teamUsers = learningAnalytics.users.filter(user => 
      user.team_name === userProfile.teams?.name || user.id === userProfile.id
    );

    const totalUsers = teamUsers.length;
    const activeUsers = teamUsers.filter(user => user.completed_exercises > 0).length;
    const avgProgress = totalUsers > 0 
      ? teamUsers.reduce((sum, user) => sum + user.completion_percentage, 0) / totalUsers 
      : 0;
    const totalTime = teamUsers.reduce((sum, user) => sum + (user.total_time_spent_minutes || 0), 0);
    const completedExercises = teamUsers.reduce((sum, user) => sum + user.completed_exercises, 0);

    // Find users needing attention (low progress)
    const needsAttention = teamUsers.filter(user => user.completion_percentage < 30).length;
    const onTrack = teamUsers.filter(user => user.completion_percentage >= 70).length;
    
    return {
      totalUsers,
      activeUsers,
      avgProgress: Math.round(avgProgress),
      totalTime,
      completedExercises,
      needsAttention,
      onTrack,
      teamUsers
    };
  }, [learningAnalytics, userProfile]);

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

  // Format time helper
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          Dashboard Leader
        </h1>
        <p className="text-muted-foreground mt-2">
          Chào mừng, {userProfile.full_name || userProfile.email}! Theo dõi tiến độ học tập và hiệu suất team của bạn trong tháng {format(new Date(), "MMMM yyyy", { locale: vi })}.
        </p>
      </div>

      {/* Team Learning Metrics */}
      {teamMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số thành viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMetrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {teamMetrics.activeUsers} đang học tập
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiến độ trung bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMetrics.avgProgress}%</div>
              <Progress value={teamMetrics.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(teamMetrics.totalTime)}</div>
              <p className="text-xs text-muted-foreground">
                {teamMetrics.completedExercises} bài hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái team</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default" className="bg-green-600">
                  {teamMetrics.onTrack} tốt
                </Badge>
                {teamMetrics.needsAttention > 0 && (
                  <Badge variant="destructive">
                    {teamMetrics.needsAttention} cần hỗ trợ
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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