
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingCourses, useTrainingVideos, useUserCourseProgress } from "@/hooks/useTrainingCourses";
import { BookOpen, Video, Play, CheckCircle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TrainingContentPage = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  
  const { data: courses, isLoading: coursesLoading } = useTrainingCourses();
  const { data: videos, isLoading: videosLoading } = useTrainingVideos(selectedCourseId || "");
  const { data: progress } = useUserCourseProgress(selectedCourseId || undefined);

  const selectedCourse = courses?.find(c => c.id === selectedCourseId);
  const selectedVideo = videos?.find(v => v.id === selectedVideoId);
  const courseProgress = progress?.find(p => p.course_id === selectedCourseId);

  React.useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  React.useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  const getProgressPercentage = () => {
    if (!selectedCourse || !courseProgress) return 0;
    
    const studyProgress = (courseProgress.completed_study_sessions / selectedCourse.min_study_sessions) * 50;
    const reviewProgress = (courseProgress.completed_review_videos / selectedCourse.min_review_videos) * 50;
    
    return Math.min(studyProgress + reviewProgress, 100);
  };

  if (coursesLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Danh sách khóa học */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Khóa đào tạo
          </h2>
          
          {courses?.map((course) => {
            const isActive = course.id === selectedCourseId;
            const courseProgressData = progress?.find(p => p.course_id === course.id);
            
            return (
              <Card 
                key={course.id} 
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent",
                  isActive && "ring-2 ring-primary"
                )}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setSelectedVideoId(null);
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {course.min_study_sessions} buổi học
                      <Video className="h-3 w-3 ml-2" />
                      {course.min_review_videos} video ôn tập
                    </div>
                    
                    {courseProgressData && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Tiến độ</span>
                          <span>{courseProgressData.is_completed ? "Hoàn thành" : "Đang học"}</span>
                        </div>
                        <Progress 
                          value={courseProgressData.is_completed ? 100 : 
                            ((courseProgressData.completed_study_sessions / course.min_study_sessions) * 50) +
                            ((courseProgressData.completed_review_videos / course.min_review_videos) * 50)
                          } 
                          className="h-1" 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main content - Nội dung khóa học */}
      <div className="flex-1 overflow-y-auto">
        {selectedCourse ? (
          <div className="p-6 space-y-6">
            {/* Header khóa học */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
                {courseProgress?.is_completed && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Hoàn thành
                  </Badge>
                )}
              </div>
              {selectedCourse.description && (
                <p className="text-muted-foreground">{selectedCourse.description}</p>
              )}
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tiến độ tổng thể</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
            </div>

            {/* Danh sách video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video học tập
                </CardTitle>
                <CardDescription>
                  Chọn video để bắt đầu học tập
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : videos && videos.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video, index) => (
                      <Card 
                        key={video.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-accent",
                          video.id === selectedVideoId && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedVideoId(video.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{video.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                {video.duration && (
                                  <span>{Math.floor(video.duration / 60)} phút</span>
                                )}
                                {video.is_review_video && (
                                  <Badge variant="secondary" className="text-xs">
                                    Video ôn tập
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button size="sm" className="ml-auto">
                              <Play className="h-3 w-3 mr-1" />
                              Xem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Khóa học này chưa có video nào
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video player */}
            {selectedVideo && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedVideo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p>Video player sẽ được tích hợp ở đây</p>
                      <p className="text-sm">URL: {selectedVideo.video_url}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Chọn một khóa đào tạo để bắt đầu học</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingContentPage;
