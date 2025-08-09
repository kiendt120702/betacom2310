import React, { useState, useEffect } from "react";
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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoResolution, setVideoResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [videoQuality, setVideoQuality] = useState<string>("auto");
  const [currentBitrate, setCurrentBitrate] = useState<number>(0);
  const [networkSpeed, setNetworkSpeed] = useState<number>(0);

  // Define available quality options (simulated - trong thực tế cần multiple video files)
  const qualityOptions = [
    { id: "auto", label: "Tự động", resolution: "", bitrate: 0, isAuto: true },
    {
      id: "1080p_high",
      label: "1080p (2621 kbps) HD",
      resolution: "1080p",
      bitrate: 2621,
      width: 1920,
      height: 1080,
    },
    {
      id: "1080p_med",
      label: "1080p (2557 kbps) HD",
      resolution: "1080p",
      bitrate: 2557,
      width: 1920,
      height: 1080,
    },
    {
      id: "720p_high",
      label: "720p (1274 kbps)",
      resolution: "720p",
      bitrate: 1274,
      width: 1280,
      height: 720,
    },
    {
      id: "720p_med",
      label: "720p (1210 kbps)",
      resolution: "720p",
      bitrate: 1210,
      width: 1280,
      height: 720,
    },
    {
      id: "480p_high",
      label: "480p (672 kbps)",
      resolution: "480p",
      bitrate: 672,
      width: 854,
      height: 480,
    },
    {
      id: "480p_med",
      label: "480p (608 kbps)",
      resolution: "480p",
      bitrate: 608,
      width: 854,
      height: 480,
    },
    {
      id: "240p_high",
      label: "240p (336 kbps)",
      resolution: "240p",
      bitrate: 336,
      width: 426,
      height: 240,
    },
    {
      id: "240p_low",
      label: "240p (272 kbps)",
      resolution: "240p",
      bitrate: 272,
      width: 426,
      height: 240,
    },
  ];

  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useTrainingCourses();
  const { data: videos, isLoading: videosLoading } = useTrainingVideos(
    selectedCourseId || ""
  );
  const { data: progress } = useUserCourseProgress(
    selectedCourseId || undefined
  );
  const { markVideoComplete, getVideoProgress } = useVideoProgress();
  const { data: videoProgress } = getVideoProgress(user?.id);

  // Tạo ordered progression system từ các courses
  const trainingProgression = courses?.sort((a, b) => {
    // Ưu tiên sort theo order_index nếu có, fallback về created_at
    if (a.order_index && b.order_index) {
      return a.order_index - b.order_index;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }) || [];

  // Helper functions cho progression logic
  const isVideoCompleted = (videoId: string) => {
    return videoProgress?.some(vp => vp.video_id === videoId && vp.is_completed) || false;
  };

  const getCompletedVideosInCourse = (courseId: string, courseVideos: any[]) => {
    if (!courseVideos) return [];
    return courseVideos.filter(video => isVideoCompleted(video.id));
  };

  const isCourseUnlocked = (courseIndex: number) => {
    if (courseIndex === 0) return true; // First course is always unlocked
    
    const previousCourse = trainingProgression[courseIndex - 1];
    if (!previousCourse) return false;
    
    // Check if user completed all videos in previous course
    const previousCourseVideos = videos; // This would need to be fetched for each course
    // For now, simplified check - in real implementation you'd fetch videos for each course
    return true; // Simplified for demo
  };

  const getNextAvailableVideo = (courseVideos: any[]) => {
    if (!courseVideos || courseVideos.length === 0) return null;
    
    // Sort videos by order_index
    const sortedVideos = [...courseVideos].sort((a, b) => a.order_index - b.order_index);
    
    // Find first incomplete video
    for (const video of sortedVideos) {
      if (!isVideoCompleted(video.id)) {
        return video;
      }
    }
    
    return null; // All videos completed
  };

  const isVideoUnlocked = (video: any, courseVideos: any[]) => {
    if (!courseVideos) return false;
    
    const sortedVideos = [...courseVideos].sort((a, b) => a.order_index - b.order_index);
    const videoIndex = sortedVideos.findIndex(v => v.id === video.id);
    
    if (videoIndex === 0) return true; // First video is always unlocked
    
    // Check if all previous videos are completed
    const previousVideos = sortedVideos.slice(0, videoIndex);
    return previousVideos.every(prevVideo => isVideoCompleted(prevVideo.id));
  };

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  const selectedVideo = videos?.find((v) => v.id === selectedVideoId);
  const courseProgress = progress?.find(
    (p) => p.course_id === selectedCourseId
  );

  React.useEffect(() => {
    if (trainingProgression.length > 0 && !selectedCourseId) {
      // Auto-select first course (theo progression order)
      setSelectedCourseId(trainingProgression[0].id);
    }
  }, [trainingProgression, selectedCourseId]);

  React.useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideoId) {
      // Auto-select next available video (first unlocked incomplete video)
      const nextVideo = getNextAvailableVideo(videos);
      if (nextVideo) {
        setSelectedVideoId(nextVideo.id);
      } else {
        // If all videos completed, select first video
        setSelectedVideoId(videos[0].id);
      }
    }
  }, [videos, selectedVideoId, videoProgress]);

  // Ngăn chặn download và copy video
  useEffect(() => {
    const showWarning = () => {
      alert(
        "⚠️ Nội dung được bảo vệ bản quyền. Không được phép tải xuống hoặc sao chép!"
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ngăn Ctrl+S, Ctrl+U, F12, Ctrl+Shift+I, Ctrl+Shift+C
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "u")) ||
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "C" || e.key === "J"))
      ) {
        e.preventDefault();
        showWarning();
        return false;
      }
    };

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      showWarning();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [selectedVideo]);

  // Disable text selection trên toàn trang khi có video
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.webkitUserSelect = "none";
      document.body.style.userSelect = "none"; // Use standard property
    }

    return () => {
      document.body.style.webkitUserSelect = "";
      document.body.style.userSelect = ""; // Use standard property
    };
  }, [selectedVideo]);

  // Bandwidth detection và auto quality selection
  useEffect(() => {
    const detectNetworkSpeed = async () => {
      if (!selectedVideo) return;

      const startTime = Date.now();
      try {
        // Test download một file nhỏ để đo tốc độ
        const response = await fetch(selectedVideo.video_url, {
          method: "HEAD",
        });
        const contentLength = response.headers.get("content-length");

        if (contentLength) {
          const fileSize = parseInt(contentLength);
          const duration = (Date.now() - startTime) / 1000;
          const speedBps = fileSize / duration; // bytes per second
          const speedKbps = (speedBps * 8) / 1000; // convert to kbps

          setNetworkSpeed(speedKbps);

          // Auto-select quality based on network speed
          if (videoQuality === "auto") {
            let selectedQuality = "240p_low";

            if (speedKbps > 3000) selectedQuality = "1080p_high";
            else if (speedKbps > 2800) selectedQuality = "1080p_med";
            else if (speedKbps > 1500) selectedQuality = "720p_high";
            else if (speedKbps > 1300) selectedQuality = "720p_med";
            else if (speedKbps > 800) selectedQuality = "480p_high";
            else if (speedKbps > 700) selectedQuality = "480p_med";
            else if (speedKbps > 400) selectedQuality = "240p_high";

            const selectedOption = qualityOptions.find(
              (q) => q.id === selectedQuality
            );
            if (selectedOption) {
              setCurrentBitrate(selectedOption.bitrate);
            }
          }
        }
      } catch (error) {
        console.log("Network speed detection failed:", error);
        setNetworkSpeed(1000); // Default fallback
      }
    };

    detectNetworkSpeed();
  }, [selectedVideo, videoQuality]);

  // Get current quality info
  const getCurrentQualityInfo = () => {
    if (videoQuality === "auto") {
      const autoSelected = qualityOptions.find(
        (q) => q.bitrate === currentBitrate
      );
      return autoSelected || qualityOptions[0];
    }
    return (
      qualityOptions.find((q) => q.id === videoQuality) || qualityOptions[0]
    );
  };

  // Handle quality change (trong thực tế sẽ thay đổi video source)
  const handleQualityChange = (newQuality: string) => {
    setVideoQuality(newQuality);

    if (newQuality !== "auto") {
      const selectedOption = qualityOptions.find((q) => q.id === newQuality);
      if (selectedOption) {
        setCurrentBitrate(selectedOption.bitrate);

        // Trong thực tế, bạn sẽ cần:
        // 1. Pause video hiện tại
        // 2. Lưu current time
        // 3. Thay đổi video source URL
        // 4. Load video mới
        // 5. Seek tới thời điểm đã lưu
        // 6. Resume playback

        const video = document.querySelector("video");
        if (video) {
          const currentTime = video.currentTime;
          const isPlaying = !video.paused;

          // Simulated quality change
          console.log(`Changing quality to: ${selectedOption.label}`);
          console.log(
            `Current time: ${currentTime}, Was playing: ${isPlaying}`
          );

          // In a real implementation, you would change video.src here
          // video.src = getVideoUrlForQuality(selectedVideo.video_url, newQuality);
          // video.currentTime = currentTime;
          // if (isPlaying) video.play();
        }
      }
    }
  };

  // Handle completing current video
  const handleCompleteVideo = async () => {
    if (!selectedVideo || !selectedCourse) return;
    
    try {
      await markVideoComplete.mutateAsync({
        videoId: selectedVideo.id,
        courseId: selectedCourse.id,
      });
      
      // Auto-advance to next video if available
      const nextVideo = getNextAvailableVideo(videos || []);
      if (nextVideo && nextVideo.id !== selectedVideo.id) {
        setSelectedVideoId(nextVideo.id);
      }
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  const getProgressPercentage = () => {
    if (!selectedCourse || !courseProgress) return 0;

    const studyProgress =
      (courseProgress.completed_study_sessions /
        selectedCourse.min_study_sessions) *
      50;
    const reviewProgress =
      (selectedCourse.min_review_videos > 0
        ? courseProgress.completed_review_videos /
          selectedCourse.min_review_videos
        : 1) * 50; // Handle division by zero

    return Math.min(studyProgress + reviewProgress, 100);
  };

  if (coursesLoading) {
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
      {/* Sidebar - Danh sách khóa học */}
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lộ trình đào tạo
          </h2>

          {trainingProgression?.map((course, courseIndex) => {
            const isActive = course.id === selectedCourseId;
            const courseProgressData = progress?.find(
              (p) => p.course_id === course.id
            );
            const courseUnlocked = isCourseUnlocked(courseIndex);

            return (
              <div key={course.id} className="relative">
                {/* Step number indicator */}
                <div className="absolute -left-2 top-4 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {courseIndex + 1}
                </div>
                
                <Card
                  className={cn(
                    "ml-4 transition-colors",
                    isActive && "ring-2 ring-primary",
                    courseUnlocked ? "cursor-pointer hover:bg-accent" : "opacity-60"
                  )}
                  onClick={() => {
                    if (courseUnlocked) {
                      setSelectedCourseId(course.id);
                      setSelectedVideoId(null);
                    }
                  }}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium line-clamp-2 flex-1">{course.title}</h3>
                        {!courseUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
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
                          <span>
                            {courseProgressData.is_completed
                              ? "Hoàn thành"
                              : "Đang học"}
                          </span>
                        </div>
                        <Progress
                          value={
                            courseProgressData.is_completed
                              ? 100
                              : (courseProgressData.completed_study_sessions /
                                  course.min_study_sessions) *
                                  50 +
                                (courseProgressData.completed_review_videos /
                                  (course.min_review_videos || 1)) *
                                  50
                          }
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
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
                <p className="text-muted-foreground">
                  {selectedCourse.description}
                </p>
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
                      const videoCompleted = isVideoCompleted(video.id);
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
                      "aspect-video w-full max-w-5xl mx-auto",
                      videoQuality === "low" && "max-w-2xl",
                      videoQuality === "medium" && "max-w-3xl",
                      videoQuality === "high" && "max-w-5xl"
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
                        setVideoResolution({
                          width: video.videoWidth,
                          height: video.videoHeight,
                        });
                        // Disable video caching
                        video.setAttribute("crossorigin", "anonymous");
                      }}
                      style={{
                        WebkitUserSelect: "none",
                        userSelect: "none", // Use standard property
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
                        userSelect: "none", // Use standard property
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
                              {getCurrentQualityInfo().resolution ||
                                (videoResolution.height >= 1080
                                  ? "HD"
                                  : videoResolution.height >= 720
                                  ? "HD Ready"
                                  : "SD")}
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
                        {selectedVideo && !isVideoCompleted(selectedVideo.id) && (
                          <Button 
                            onClick={handleCompleteVideo}
                            disabled={markVideoComplete.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {markVideoComplete.isPending ? "Đang xử lý..." : "Hoàn thành"}
                          </Button>
                        )}
                        {selectedVideo && isVideoCompleted(selectedVideo.id) && (
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