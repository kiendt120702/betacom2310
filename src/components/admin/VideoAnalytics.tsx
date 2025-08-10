import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart3, 
  Users, 
  Video, 
  Clock, 
  TrendingUp, 
  Eye,
  PlayCircle,
  Target,
  Award
} from "lucide-react";
import { 
  useVideoAnalyticsOverview,
  useExerciseVideoStats,
  useUserVideoStats,
  formatAnalyticsTime,
  getCompletionColor,
  getCompletionBadgeVariant
} from "@/hooks/useVideoAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const VideoAnalytics: React.FC = () => {
  const { data: overview, isLoading: overviewLoading } = useVideoAnalyticsOverview();
  const { data: exerciseStats, isLoading: exerciseLoading } = useExerciseVideoStats();
  const { data: userStats, isLoading: userLoading } = useUserVideoStats();

  if (overviewLoading) {
    return <VideoAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Phân tích Video</h1>
        <p className="text-muted-foreground">
          Thống kê chi tiết về thời gian học và hành vi xem video của người dùng
        </p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{overview.total_users}</p>
                  <p className="text-xs text-muted-foreground">Người học</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{overview.total_videos}</p>
                  <p className="text-xs text-muted-foreground">Video có data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{formatAnalyticsTime(overview.avg_watch_time)}</p>
                  <p className="text-xs text-muted-foreground">Thời gian TB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{overview.completion_rate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Tỷ lệ hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{overview.total_sessions}</p>
                  <p className="text-xs text-muted-foreground">Lượt xem</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exercises">Theo bài học</TabsTrigger>
          <TabsTrigger value="users">Theo người dùng</TabsTrigger>
        </TabsList>

        {/* Exercise Analytics */}
        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Phân tích theo bài học
              </CardTitle>
              <CardDescription>
                Thống kê chi tiết về từng video bài học - hiệu quả và engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exerciseLoading ? (
                <ExerciseStatsSkeleton />
              ) : exerciseStats && exerciseStats.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bài học</TableHead>
                        <TableHead className="text-center">Người xem</TableHead>
                        <TableHead className="text-center">Thời gian TB</TableHead>
                        <TableHead className="text-center">Hoàn thành TB</TableHead>
                        <TableHead className="text-center">Lượt xem lại</TableHead>
                        <TableHead className="text-center">Đánh giá</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exerciseStats.map((exercise) => (
                        <TableRow key={exercise.exercise_id}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate">{exercise.exercise_title}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                              <Eye className="h-3 w-3" />
                              {exercise.total_viewers}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {formatAnalyticsTime(exercise.avg_watch_time)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getCompletionBadgeVariant(exercise.avg_completion_rate)}>
                              {exercise.avg_completion_rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {exercise.avg_rewatch_count.toFixed(1)}×
                          </TableCell>
                          <TableCell className="text-center">
                            {exercise.avg_completion_rate >= 80 ? (
                              <Badge className="bg-green-500">
                                <Award className="h-3 w-3 mr-1" />
                                Xuất sắc
                              </Badge>
                            ) : exercise.avg_completion_rate >= 60 ? (
                              <Badge variant="secondary">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Khá tốt
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Cần cải thiện
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu phân tích video</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Analytics */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Phân tích theo người dùng
              </CardTitle>
              <CardDescription>
                Thống kê chi tiết về hoạt động học tập của từng người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <UserStatsSkeleton />
              ) : userStats && userStats.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người dùng</TableHead>
                        <TableHead className="text-center">Video đã xem</TableHead>
                        <TableHead className="text-center">Tổng thời gian</TableHead>
                        <TableHead className="text-center">Hoàn thành TB</TableHead>
                        <TableHead className="text-center">Lượt xem</TableHead>
                        <TableHead>Video yêu thích</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userStats.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">
                            <div className="max-w-xs truncate">
                              {user.user_email}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {user.videos_watched}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {formatAnalyticsTime(user.total_watch_time)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={getCompletionColor(user.avg_completion_rate)}>
                              {user.avg_completion_rate.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {user.total_sessions}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-muted-foreground">
                              {user.most_watched_exercise}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu người dùng</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Skeleton components
const VideoAnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ExerciseStatsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center p-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

const UserStatsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center p-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>
    ))}
  </div>
);

export default VideoAnalytics;