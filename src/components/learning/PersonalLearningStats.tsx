
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Video, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Award,
  Calendar,
  Play
} from "lucide-react";
import { 
  usePersonalLearningStats, 
  formatLearningTime, 
  getStreakMessage,
  getLearningLevel 
} from "@/hooks/usePersonalLearningStats";
import { Skeleton } from "@/components/ui/skeleton";
import PersonalExerciseDetails from "@/components/learning-progress/PersonalExerciseDetails";

interface PersonalLearningStatsProps {
  variant?: "full" | "compact";
  showTitle?: boolean;
}

const PersonalLearningStats: React.FC<PersonalLearningStatsProps> = ({ 
  variant = "full",
  showTitle = true 
}) => {
  const { data: stats, isLoading } = usePersonalLearningStats();

  if (isLoading) {
    return <PersonalLearningStatsSkeleton variant={variant} />;
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu học tập</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const learningLevel = getLearningLevel(stats.totalWatchTime);
  const completionPercentage = stats.totalExercises > 0 
    ? (stats.completedExercises / stats.totalExercises) * 100 
    : 0;

  if (variant === "compact") {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">
                  {formatLearningTime(stats.totalWatchTime)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Thời gian học</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  {stats.completedExercises}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Bài hoàn thành</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-lg font-bold text-purple-600">
                  {learningLevel.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Cấp độ</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">
                  {stats.learningStreak}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Streak (ngày)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h2 className="text-2xl font-bold text-foreground">Thống kê học tập của bạn</h2>
          <p className="text-muted-foreground">Theo dõi tiến độ và thành tích học tập</p>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatLearningTime(stats.totalWatchTime)}
                </p>
                <p className="text-sm text-muted-foreground">Tổng thời gian học</p>
                <p className="text-xs text-muted-foreground">
                  TB: {formatLearningTime(stats.dailyAverage)}/ngày
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedExercises}/{stats.totalExercises}
                </p>
                <p className="text-sm text-muted-foreground">Bài tập hoàn thành</p>
                <Progress value={completionPercentage} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xl font-bold text-purple-600">{learningLevel.level}</p>
                  {learningLevel.progress === 100 && <Badge>Max</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">Cấp độ hiện tại</p>
                {learningLevel.progress < 100 && (
                  <Progress value={learningLevel.progress} className="mt-2" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.learningStreak}</p>
                <p className="text-sm text-muted-foreground">Streak hiện tại</p>
                <p className="text-xs text-orange-600 font-medium">
                  {getStreakMessage(stats.learningStreak)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Tổng quan học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Video đã xem</span>
                <Badge variant="outline">{stats.totalVideosWatched}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tổng lượt xem</span>
                <Badge variant="outline">{stats.totalSessions}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tỷ lệ hoàn thành TB</span>
                <Badge 
                  variant={stats.avgCompletionRate >= 80 ? "default" : 
                          stats.avgCompletionRate >= 60 ? "secondary" : "destructive"}
                >
                  {stats.avgCompletionRate.toFixed(1)}%
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hiệu quả học tập</span>
                <Badge variant={
                  stats.avgCompletionRate >= 80 ? "default" : 
                  stats.avgCompletionRate >= 60 ? "secondary" : "outline"
                }>
                  {stats.avgCompletionRate >= 80 ? "Xuất sắc" :
                   stats.avgCompletionRate >= 60 ? "Tốt" : "Cần cải thiện"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Watched Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Bài học yêu thích
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.mostWatchedExercise ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium line-clamp-2">
                    {stats.mostWatchedExercise.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Đã xem {formatLearningTime(stats.mostWatchedExercise.watch_time)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Chiếm {((stats.mostWatchedExercise.watch_time / stats.totalWatchTime) * 100).toFixed(1)}% 
                    tổng thời gian học
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có bài học nào được xem</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Exercise Progress */}
      <PersonalExerciseDetails />
    </div>
  );
};

// Skeleton component
const PersonalLearningStatsSkeleton: React.FC<{ variant: "full" | "compact" }> = ({ variant }) => {
  if (variant === "compact") {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalLearningStats;
