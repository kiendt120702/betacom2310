
import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePersonalLearningStats } from "@/hooks/usePersonalLearningStats";
import { useUserLearningDetails } from "@/hooks/useUserLearningDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Clock, CheckCircle, TrendingUp, Target } from "lucide-react";
import { formatLearningTime, getStreakMessage, getLearningLevel } from "@/hooks/usePersonalLearningStats";

interface ManagementContentProps {
  activeTab: string;
}

const ManagementContent: React.FC<ManagementContentProps> = ({ activeTab }) => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: learningStats, isLoading: statsLoading } = usePersonalLearningStats();
  const { data: learningDetails, isLoading: detailsLoading } = useUserLearningDetails(userProfile?.id || null);

  if (profileLoading || statsLoading || detailsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không thể tải thông tin hồ sơ</p>
      </div>
    );
  }

  const learningLevel = learningStats ? getLearningLevel(learningStats.totalWatchTime) : null;
  const completionPercentage = learningStats ? 
    Math.round((learningStats.completedExercises / learningStats.totalExercises) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Thông tin cơ bản của tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
            <p className="text-lg font-semibold">{userProfile.full_name || userProfile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg">{userProfile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Vai trò</label>
            <Badge variant="secondary">{userProfile.role}</Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Team</label>
            <p className="text-lg">{userProfile.teams?.name || "Chưa có team"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài tập hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats?.completedExercises || 0}</div>
            <p className="text-xs text-muted-foreground">
              Trên tổng {learningStats?.totalExercises || 0} bài
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thời gian học</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {learningStats ? formatLearningTime(learningStats.totalWatchTime) : "0m"}
            </div>
            <p className="text-xs text-muted-foreground">
              Thời gian xem video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuỗi học tập</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats?.learningStreak || 0} ngày</div>
            <p className="text-xs text-muted-foreground">
              {learningStats ? getStreakMessage(learningStats.learningStreak) : "Hãy bắt đầu!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cấp độ học tập</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {learningLevel ? `${learningLevel.name}` : "Chưa xác định"}
            </div>
            <p className="text-xs text-muted-foreground">
              Cấp {learningLevel?.level || 1}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Tiến độ chi tiết
          </CardTitle>
          <CardDescription>
            Tiến độ hoàn thành các bài tập
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Tổng tiến độ</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {learningLevel && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tiến độ cấp độ</span>
                <span className="text-sm text-muted-foreground">{learningLevel.progress}%</span>
              </div>
              <Progress value={learningLevel.progress} className="h-2" />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Thống kê</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Video đã xem:</span>
                  <span>{learningStats?.totalVideosWatched || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phiên học:</span>
                  <span>{learningStats?.totalSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trung bình/ngày:</span>
                  <span>{learningStats ? formatLearningTime(learningStats.dailyAverage) : "0m"}</span>
                </div>
              </div>
            </div>

            {learningStats?.mostWatchedExercise && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Bài học yêu thích</p>
                <div className="text-sm">
                  <p className="font-medium">{learningStats.mostWatchedExercise.title}</p>
                  <p className="text-muted-foreground">
                    {formatLearningTime(learningStats.mostWatchedExercise.watch_time)} xem
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagementContent;
