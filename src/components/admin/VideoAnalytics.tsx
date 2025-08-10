
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Users, Eye, Clock, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useVideoAnalytics, formatAnalyticsTime, getCompletionColor, getCompletionBadgeVariant } from "@/hooks/useVideoAnalytics";

const VideoAnalytics = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: analytics, isLoading, error } = useVideoAnalytics(
    dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
  );

  const resetDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Video Analytics</h2>
          <p className="text-muted-foreground">
            Thống kê chi tiết về hoạt động xem video
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Chọn thời gian"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {(dateRange.from || dateRange.to) && (
            <Button variant="outline" onClick={resetDateRange} size="sm">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Số người dùng xem video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng lượt xem video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian xem TB</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAnalyticsTime(analytics?.averageWatchTime || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Thời gian xem trung bình
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getCompletionColor(analytics?.completionRate || 0))}>
              {(analytics?.completionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ xem hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phiên xem</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tổng phiên xem
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top-videos">Video phổ biến</TabsTrigger>
          <TabsTrigger value="detailed-stats">Thống kê chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="top-videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Video được xem nhiều nhất</CardTitle>
              <CardDescription>
                Danh sách video có lượt xem cao nhất trong khoảng thời gian được chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.topVideos && analytics.topVideos.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topVideos.map((video, index) => (
                    <div key={video.video_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">ID: {video.video_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{video.views}</div>
                        <p className="text-xs text-muted-foreground">lượt xem</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu video</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed-stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê chi tiết</CardTitle>
                <CardDescription>
                  Các chỉ số performance chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng video:</span>
                  <span className="font-medium">{analytics?.topVideos ? analytics.topVideos.length : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Video có lượt xem:</span>
                  <span className="font-medium">{analytics?.topVideos ? analytics.topVideos.filter(v => v.views > 0).length : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tỷ lệ hoàn thành:</span>
                  <Badge variant={getCompletionBadgeVariant(analytics?.completionRate || 0)}>
                    {(analytics?.completionRate || 0).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Video</CardTitle>
                <CardDescription>
                  Video có hiệu suất tốt nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topVideos && analytics.topVideos.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.topVideos.slice(0, 5).map((video, index) => (
                      <div key={video.video_id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{video.title}</span>
                        <span className="font-medium ml-2">{video.views}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoAnalytics;
