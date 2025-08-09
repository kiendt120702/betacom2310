
import React, { useState } from 'react';
import { useTrainingCourses } from '@/hooks/useTrainingCourses';
import { useTrainingVideos } from '@/hooks/useTrainingVideos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, BookOpen, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const TrainingContentPage = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const { data: courses, isLoading: coursesLoading } = useTrainingCourses();
  const { data: videos, isLoading: videosLoading } = useTrainingVideos(selectedCourseId);

  // Tự động chọn khóa học đầu tiên nếu chưa có khóa học nào được chọn
  React.useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses?.find(course => course.id === selectedCourseId);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (coursesLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Danh sách khóa học */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {courses?.map((course) => (
                  <Button
                    key={course.id}
                    variant={selectedCourseId === course.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{course.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {course.min_study_sessions} buổi học • {course.min_review_videos} video ôn tập
                      </div>
                    </div>
                  </Button>
                ))}
                
                {(!courses || courses.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Chưa có khóa học nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Nội dung khóa học */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <div className="space-y-6">
              {/* Thông tin khóa học */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCourse.title}</CardTitle>
                  {selectedCourse.description && (
                    <p className="text-muted-foreground">{selectedCourse.description}</p>
                  )}
                  <div className="flex gap-4">
                    <Badge variant="outline">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {selectedCourse.min_study_sessions} buổi học tối thiểu
                    </Badge>
                    <Badge variant="outline">
                      <Video className="w-4 h-4 mr-1" />
                      {selectedCourse.min_review_videos} video ôn tập
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Danh sách video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Danh sách video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {videosLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videos?.map((video) => (
                        <Card key={video.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                  <Play className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{video.title}</h4>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatDuration(video.duration)}
                                    </div>
                                    <Badge
                                      variant={video.is_review_video ? "secondary" : "default"}
                                      className="text-xs"
                                    >
                                      {video.is_review_video ? "Video ôn tập" : "Video học"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="ml-4">
                              <Play className="w-4 h-4 mr-2" />
                              Xem
                            </Button>
                          </div>
                        </Card>
                      ))}

                      {(!videos || videos.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Chưa có video nào cho khóa học này</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Vui lòng chọn một khóa học để xem nội dung</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingContentPage;
