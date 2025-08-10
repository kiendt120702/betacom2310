
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Clock, FileText, Video } from "lucide-react";
import { EduExercise } from "@/hooks/useEduExercises";
import { useVideoTracking, formatWatchTime } from "@/hooks/useVideoTracking";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import RecapSubmissionDialog from "./RecapSubmissionDialog";

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({ exercise, onComplete }) => {
  const [showRecapDialog, setShowRecapDialog] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [canSubmitRecap, setCanSubmitRecap] = useState(false);

  const { trackVideoProgress, isTracking } = useVideoTracking();
  const progressData = null; // This would come from the tracking hook

  useEffect(() => {
    // Check if video is completed to enable recap submission
    if (progressData?.is_completed) {
      setIsVideoCompleted(true);
      setCanSubmitRecap(true);
    }
  }, [progressData]);

  const handleVideoProgress = (currentTime: number, duration: number) => {
    const progress = Math.round((currentTime / duration) * 100);
    setVideoProgress(progress);

    // Track progress every 30 seconds or on completion
    if (currentTime % 30 === 0 || progress === 100) {
      trackVideoProgress({
        videoId: exercise.id,
        currentTime,
        duration,
        isCompleted: progress >= 90, // Consider 90% as completed
      });
    }
  };

  const handleVideoEnded = () => {
    setIsVideoCompleted(true);
    setCanSubmitRecap(true);
    trackVideoProgress({
      videoId: exercise.id,
      currentTime: 0,
      duration: 0,
      isCompleted: true,
    });
  };

  const handleSubmitRecap = () => {
    setShowRecapDialog(false);
    onComplete?.();
  };

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const exerciseDescription = exercise.title || "Mô tả bài tập";
  const hasDescription = exercise.title && exercise.title.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getExerciseTypeIcon(exercise.type)}
              <CardTitle>{exercise.title}</CardTitle>
            </div>
            <Badge variant={isVideoCompleted ? "default" : "secondary"}>
              {isVideoCompleted ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã hoàn thành
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Đang học
                </>
              )}
            </Badge>
          </div>
          {hasDescription && (
            <CardDescription>{exerciseDescription}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {exercise.type === "video" && exercise.video_url && (
            <div className="space-y-4">
              {videoProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tiến độ xem video</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <Progress value={videoProgress} className="w-full" />
                </div>
              )}
              
              <div className="rounded-lg overflow-hidden">
                <SecureVideoPlayer
                  videoUrl={exercise.video_url}
                  onProgress={handleVideoProgress}
                  onEnded={handleVideoEnded}
                />
              </div>
            </div>
          )}

          {exercise.type === "reading" && (
            <div className="prose max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: exercise.title || '<p>Nội dung đang được cập nhật...</p>' 
                }} 
              />
            </div>
          )}

          {progressData && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Thời gian xem: {formatWatchTime(progressData.watch_count || 0)}</span>
              <span>Lần cuối xem: {progressData.last_watched_at ? new Date(progressData.last_watched_at).toLocaleDateString('vi-VN') : 'Chưa xem'}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setShowRecapDialog(true)}
              disabled={!canSubmitRecap}
              variant={canSubmitRecap ? "default" : "secondary"}
              className="flex-1"
            >
              {isTracking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu tiến độ...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {canSubmitRecap ? "Nộp bài tập" : "Hoàn thành video để nộp bài"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {exercise.instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: exercise.instructions }} 
            />
          </CardContent>
        </Card>
      )}

      <RecapSubmissionDialog
        isOpen={showRecapDialog}
        onClose={() => setShowRecapDialog(false)}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onSubmit={handleSubmitRecap}
      />
    </div>
  );
};

export default ExerciseContent;
