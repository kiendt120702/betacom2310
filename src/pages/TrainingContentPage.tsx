
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTrainingCourses,
  useTrainingVideos,
  useUserCourseProgress,
  useVideoProgress,
} from "@/hooks/useTrainingCourses";
import { useEduExercises, useUserExerciseProgress, useUpdateExerciseProgress } from "@/hooks/useEduExercises";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Video,
  Play,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Monitor,
  Lock,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TrainingContentPage = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get('exercise');
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  
  // Add missing video-related state variables
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);
  const [networkSpeed, setNetworkSpeed] = useState(0);
  const [videoQuality, setVideoQuality] = useState("auto");
  const [currentBitrate, setCurrentBitrate] = useState(0);

  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useTrainingCourses();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: userExerciseProgress } = useUserExerciseProgress();
  const { mutate: updateExerciseProgress } = useUpdateExerciseProgress();
  const { data: videos, isLoading: videosLoading } = useTrainingVideos(
    selectedCourseId || ""
  );
  const { data: progress } = useUserCourseProgress(
    selectedCourseId || undefined
  );
  const videoProgressHook = useVideoProgress(user?.id);
  const { data: videoProgress, markVideoComplete } = videoProgressHook;

  // Video quality options
  const qualityOptions = [
    { id: "auto", label: "Auto", bitrate: 0 },
    { id: "1080p", label: "1080p HD", bitrate: 3000 },
    { id: "720p", label: "720p HD", bitrate: 1500 },
    { id: "480p", label: "480p SD", bitrate: 800 },
    { id: "360p", label: "360p", bitrate: 500 },
  ];

  // Helper functions
  const handleQualityChange = (quality: string) => {
    setVideoQuality(quality);
    const option = qualityOptions.find(opt => opt.id === quality);
    if (option && quality !== "auto") {
      setCurrentBitrate(option.bitrate);
    }
  };

  const getCurrentQualityInfo = () => {
    return qualityOptions.find(opt => opt.id === videoQuality) || qualityOptions[0];
  };

  // Sắp xếp exercises theo order_index
  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];
  
  // Find selected exercise
  const selectedExercise = exercises?.find(e => e.id === selectedExerciseId);
  
  // Check if exercise is completed
  const isExerciseCompleted = (exerciseId: string) => {
    return userExerciseProgress?.some(progress => 
      progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  };

  // Auto-select first exercise if none selected
  React.useEffect(() => {
    if (!selectedExerciseId && orderedExercises.length > 0) {
      // Find first incomplete exercise or first exercise
      const firstIncomplete = orderedExercises.find(ex => !isExerciseCompleted(ex.id));
      setSelectedExerciseId(firstIncomplete?.id || orderedExercises[0].id);
    }
  }, [orderedExercises, selectedExerciseId, userExerciseProgress]);

  // Auto-select course and video based on selected exercise
  React.useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      // For demo, select first course - in real app you'd map exercises to courses
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  React.useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideoId) {
      const nextVideo = getNextAvailableVideo(videos || []);
      if (nextVideo) {
        setSelectedVideoId(nextVideo.id);
      } else {
        setSelectedVideoId(videos[0].id);
      }
    }
  }, [videos, selectedVideoId, videoProgress]);

  // Helper functions
  const isVideoCompletedFn = (videoId: string) => {
    return videoProgress?.some(vp => vp.video_id === videoId && vp.is_completed) || false;
  };

  const getNextAvailableVideo = (courseVideos: any[]) => {
    if (!courseVideos || courseVideos.length === 0) return null;
    
    const sortedVideos = [...courseVideos].sort((a, b) => a.order_index - b.order_index);
    
    for (const video of sortedVideos) {
      if (!isVideoCompletedFn(video.id)) {
        return video;
      }
    }
    
    return null;
  };

  const isVideoUnlocked = (video: any, courseVideos: any[]) => {
    if (!courseVideos) return false;
    
    const sortedVideos = [...courseVideos].sort((a, b) => a.order_index - b.order_index);
    const videoIndex = sortedVideos.findIndex(v => v.id === video.id);
    
    if (videoIndex === 0) return true;
    
    const previousVideos = sortedVideos.slice(0, videoIndex);
    return previousVideos.every(prevVideo => isVideoCompletedFn(prevVideo.id));
  };

  const handleCompleteVideo = async () => {
    if (!selectedVideo || !selectedCourse) return;
    
    try {
      await markVideoComplete.mutateAsync({
        videoId: selectedVideo.id,
        courseId: selectedCourse.id,
      });
      
      const nextVideo = getNextAvailableVideo(videos || []);
      if (nextVideo && nextVideo.id !== selectedVideo.id) {
        setSelectedVideoId(nextVideo.id);
      }
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  const handleCompleteExercise = () => {
    if (!selectedExerciseId) return;
    
    updateExerciseProgress({
      exercise_id: selectedExerciseId,
      is_completed: true,
      time_spent: Math.floor((Date.now() - (startTime || Date.now())) / 60000), // Convert to minutes
    });
  };

  const [startTime, setStartTime] = useState<number>();

  React.useEffect(() => {
    if (selectedExerciseId && !startTime) {
      setStartTime(Date.now());
    }
  }, [selectedExerciseId]);

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  const selectedVideo = videos?.find((v) => v.id === selectedVideoId);
  const courseProgress = progress?.find(
    (p) => p.course_id === selectedCourseId
  );

  if (coursesLoading || exercisesLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map((i) => (
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
      {/* Sidebar - Danh sách bài tập */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lộ trình đào tạo
          </h2>

          {orderedExercises?.map((exercise, exerciseIndex) => {
            const isActive = exercise.id === selectedExerciseId;
            const exerciseCompleted = isExerciseCompleted(exercise.id);

            return (
              <div key={exercise.id} className="relative">
                <div className="absolute -left-2 top-4 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {exerciseIndex + 1}
                </div>
                
                <Card
                  className={cn(
                    "ml-4 transition-colors cursor-pointer",
                    isActive && "ring-2 ring-primary",
                    exerciseCompleted && "bg-green-50 border-green-200"
                  )}
                  onClick={() => setSelectedExerciseId(exercise.id)}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium line-clamp-2 flex-1">{exercise.title}</h3>
                        {exerciseCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {exercise.is_required && (
                          <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {selectedExercise ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
                <span>Bài tập kiến thức</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{selectedExercise.title}</h1>
                {isExerciseCompleted(selectedExercise.id) && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Hoàn thành
                  </Badge>
                )}
              </div>
            </div>

            {/* Exercise Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Nội dung học tập
                </CardTitle>
                <CardDescription>
                  Bài tập kiến thức cần hoàn thành
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedExercise.exercise_video_url ? (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "bg-black rounded-lg overflow-hidden relative",
                        "aspect-video w-full max-w-4xl mx-auto"
                      )}>
                      <video
                        className="w-full h-full object-contain"
                        controls
                        preload="metadata"
                        poster=""
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}>
                        <source src={selectedExercise.exercise_video_url} type="video/mp4" />
                        <source src={selectedExercise.exercise_video_url} type="video/webm" />
                        <source src={selectedExercise.exercise_video_url} type="video/quicktime" />
                        Trình duyệt của bạn không hỗ trợ video HTML5.
                      </video>

                      {/* Multiple watermarks */}
                      <div className="absolute top-4 right-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                        © Nội bộ công ty
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                        Bảo mật - Không tải xuống
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-4xl font-bold pointer-events-none select-none">
                        NỘI BỘ
                      </div>

                      {/* Invisible overlay to prevent right-click */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        style={{
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Xem video bài học và hoàn thành các video khóa học bên dưới để kết thúc bài tập.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Chưa có video bài học cho bài tập này.</p>
                )}
              </CardContent>
            </Card>

            {/* Video Section - Reuse existing video components */}
            {selectedCourse && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video học tập
                    </CardTitle>
                    <CardDescription>Chọn video để bắt đầu học tập</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {videosLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : videos && videos.length > 0 ? (
                      <div className="space-y-4">
                        {videos.map((video, index) => {
                          const videoCompleted = isVideoCompletedFn(video.id);
                          const videoUnlocked = isVideoUnlocked(video, videos);
                          const isActive = video.id === selectedVideoId;
                          
                          return (
                            <Card
                              key={video.id}
                              className={cn(
                                "transition-colors",
                                isActive && "ring-2 ring-primary",
                                videoUnlocked ? "cursor-pointer hover:bg-accent" : "opacity-60"
                              )}
                              onClick={() => {
                                if (videoUnlocked) {
                                  setSelectedVideoId(video.id);
                                }
                              }}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium",
                                    videoCompleted 
                                      ? "bg-green-500 text-white" 
                                      : videoUnlocked 
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                  )}>
                                    {videoCompleted ? <CheckCircle2 className="h-5 w-5" /> : 
                                     !videoUnlocked ? <Lock className="h-5 w-5" /> :
                                     index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{video.title}</h3>
                                      {videoCompleted && (
                                        <Badge variant="default" className="bg-green-500 text-xs">
                                          Hoàn thành
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      {video.duration && (
                                        <span>
                                          {Math.floor(video.duration / 60)} phút
                                        </span>
                                      )}
                                      {video.is_review_video && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs">
                                          Video ôn tập
                                        </Badge>
                                      )}
                                      {!videoUnlocked && (
                                        <Badge variant="outline" className="text-xs">
                                          Chưa mở khóa
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {videoUnlocked && (
                                      <Button size="sm" disabled={!videoUnlocked}>
                                        <Play className="h-3 w-3 mr-1" />
                                        Xem
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
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
                      <div className="flex items-center justify-between">
                        <CardTitle>{selectedVideo.title}</CardTitle>
                        {selectedVideo.is_review_video && (
                          <Badge variant="secondary">Video ôn tập</Badge>
                        )}
                      </div>
                      {selectedVideo.duration && (
                        <CardDescription>
                          Thời lượng: {Math.floor(selectedVideo.duration / 60)} phút
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        className={cn(
                          "bg-black rounded-lg overflow-hidden relative",
                          "aspect-video w-full max-w-5xl mx-auto"
                        )}>
                        <video
                          className="w-full h-full object-contain"
                          controls
                          preload="metadata"
                          poster=""
                          controlsList="nodownload nofullscreen noremoteplayback"
                          disablePictureInPicture
                          disableRemotePlayback
                          onContextMenu={(e) => e.preventDefault()}
                          onLoadedMetadata={(e) => {
                            const video = e.target as HTMLVideoElement;
                            setVideoDuration(video.duration);
                            setVideoResolution({
                              width: video.videoWidth,
                              height: video.videoHeight,
                            });
                            // Disable video caching
                            video.setAttribute("crossorigin", "anonymous");
                          }}
                          onTimeUpdate={(e) => {
                            const video = e.target as HTMLVideoElement;
                            setCurrentTime(video.currentTime);
                          }}
                          style={{
                            WebkitUserSelect: "none",
                            userSelect: "none",
                          }}>
                          <source src={selectedVideo.video_url} type="video/mp4" />
                          <source src={selectedVideo.video_url} type="video/webm" />
                          <source
                            src={selectedVideo.video_url}
                            type="video/quicktime"
                          />
                          Trình duyệt của bạn không hỗ trợ video HTML5.
                        </video>

                        {/* Multiple watermarks */}
                        <div className="absolute top-4 right-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                          © Nội bộ công ty
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded pointer-events-none">
                          Bảo mật - Không tải xuống
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-4xl font-bold pointer-events-none select-none">
                          NỘI BỘ
                        </div>

                        {/* Invisible overlay to prevent right-click */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            return false;
                          }}
                          style={{
                            WebkitUserSelect: "none",
                            userSelect: "none",
                          }}
                        />
                      </div>

                      {/* Video controls and info */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Video #{selectedVideo.order_index}
                            </div>
                            {videoResolution && (
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                {videoResolution.width}x{videoResolution.height}
                                <Badge variant="outline" className="text-xs">
                                  {videoResolution.height >= 1080
                                    ? "HD"
                                    : videoResolution.height >= 720
                                    ? "HD Ready"
                                    : "SD"}
                                </Badge>
                              </div>
                            )}
                            {networkSpeed > 0 && (
                              <div className="flex items-center gap-2 text-xs">
                                <span>Tốc độ mạng:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {networkSpeed.toFixed(0)} kbps
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <Select
                              value={videoQuality}
                              onValueChange={handleQualityChange}>
                              <SelectTrigger className="w-48 h-8 text-xs">
                                <Settings className="h-3 w-3 mr-1" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-64">
                                {qualityOptions.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{option.label}</span>
                                      {videoQuality === "auto" &&
                                        currentBitrate === option.bitrate && (
                                          <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs">
                                            Đang dùng
                                          </Badge>
                                        )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const video = document.querySelector("video");
                                if (video) {
                                  video.currentTime = 0;
                                  video.play();
                                }
                              }}>
                              <Play className="h-3 w-3 mr-1" />
                              Phát lại
                            </Button>
                            {selectedVideo && !isVideoCompletedFn(selectedVideo.id) && (
                              <Button 
                                onClick={handleCompleteVideo}
                                disabled={markVideoComplete.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {markVideoComplete.isPending ? "Đang xử lý..." : "Hoàn thành"}
                              </Button>
                            )}
                            {selectedVideo && isVideoCompletedFn(selectedVideo.id) && (
                              <Badge variant="default" className="bg-green-500 px-3 py-1">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Đã hoàn thành
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p>
                                <strong>Khóa học:</strong> {selectedCourse.title}
                              </p>
                              <p>
                                <strong>Loại:</strong>{" "}
                                {selectedVideo.is_review_video
                                  ? "Video ôn tập"
                                  : "Video học tập"}
                              </p>
                            </div>
                            <div>
                              {videoResolution && (
                                <>
                                  <p>
                                    <strong>Độ phân giải:</strong>{" "}
                                    {videoResolution.width} ×{" "}
                                    {videoResolution.height}
                                  </p>
                                  <p>
                                    <strong>Tỷ lệ khung hình:</strong>{" "}
                                    {(
                                      videoResolution.width / videoResolution.height
                                    ).toFixed(2)}
                                    :1
                                  </p>
                                </>
                              )}
                              <p>
                                <strong>Chất lượng:</strong>
                                <span className="ml-1">
                                  {getCurrentQualityInfo().label}
                                </span>
                                {currentBitrate > 0 && videoQuality === "auto" && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Auto-selected: {currentBitrate} kbps
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Complete Exercise Button */}
            {!isExerciseCompleted(selectedExercise.id) && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleCompleteExercise}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Hoàn thành bài tập
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Chọn một bài tập để bắt đầu học</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingContentPage;
