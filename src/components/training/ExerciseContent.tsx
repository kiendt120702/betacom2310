
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, FileText, Clock, BookOpen } from "lucide-react";
import { EduExercise } from "@/hooks/useEduExercises";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import RecapSubmissionDialog from "./RecapSubmissionDialog";
import { useVideoTracking, formatWatchTime } from "@/hooks/useVideoTracking";
import { useMarkVideoCompleted } from "@/hooks/useVideoCompletion";

interface ExerciseContentProps {
  exercise: EduExercise;
  isCompleted: boolean;
  isVideoCompleted: boolean;
  isRecapSubmitted: boolean;
  canCompleteExercise: boolean;
  onComplete: () => void;
  onRecapSubmitted: () => void;
  isCompletingExercise: boolean;
}

const ExerciseContent = ({ 
  exercise, 
  isCompleted, 
  isVideoCompleted,
  isRecapSubmitted,
  canCompleteExercise,
  onComplete, 
  onRecapSubmitted,
  isCompletingExercise 
}: ExerciseContentProps) => {
  const [showRecapDialog, setShowRecapDialog] = useState(false);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  
  const { trackVideoProgress, isTracking } = useVideoTracking();
  const { mutate: markVideoCompleted } = useMarkVideoCompleted();

  // Track video progress when video is watched
  const handleVideoProgress = (currentTime: number, duration: number) => {
    setVideoWatchTime(currentTime);
    
    // Track progress every 30 seconds
    if (Math.floor(currentTime) % 30 === 0) {
      trackVideoProgress({
        videoId: exercise.id,
        courseId: "default-course", // You might want to pass this as prop
        currentTime,
        duration,
        isCompleted: currentTime >= duration * 0.9 // 90% completion
      });
    }
  };

  const handleVideoCompleted = () => {
    markVideoCompleted(exercise.id);
  };

  const handleRecapSubmission = () => {
    setShowRecapDialog(false);
    onRecapSubmitted();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{exercise.title}</h1>
              {exercise.description && (
                <p className="text-muted-foreground">{exercise.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {exercise.is_required && (
                <Badge variant="secondary">Bắt buộc</Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hoàn thành
                </Badge>
              )}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              <span>Video: {isVideoCompleted ? "✓" : "Chưa xem"}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Recap: {isRecapSubmitted ? "✓" : "Chưa gửi"}</span>
            </div>
            {videoWatchTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Đã xem: {formatWatchTime(videoWatchTime / 60)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        {exercise.exercise_video_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Video bài học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SecureVideoPlayer
                  src={exercise.exercise_video_url}
                  onProgress={handleVideoProgress}
                  onEnded={handleVideoCompleted}
                />
                
                {!isVideoCompleted && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Xem hết video để có thể tiếp tục</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Section */}
        {exercise.content && (
          <Card>
            <CardHeader>
              <CardTitle>Nội dung bài học</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: exercise.content }}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Section */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowRecapDialog(true)}
                disabled={!isVideoCompleted || isRecapSubmitted}
                variant={isRecapSubmitted ? "secondary" : "default"}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isRecapSubmitted ? "Đã gửi Recap" : "Gửi Recap"}
              </Button>

              <Button
                onClick={onComplete}
                disabled={!canCompleteExercise || isCompleted}
                variant={isCompleted ? "secondary" : "default"}
                className="flex-1"
                loading={isCompletingExercise}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isCompleted ? "Đã hoàn thành" : "Hoàn thành bài tập"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Xem hết video để có thể gửi recap</p>
              <p>• Gửi recap để có thể hoàn thành bài tập</p>
              <p>• Hoàn thành bài tập để mở khóa bài tiếp theo</p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Phiên học tối thiểu:</span>
              <Badge variant="outline">{exercise.min_study_sessions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Video ôn tập tối thiểu:</span>
              <Badge variant="outline">{exercise.min_review_videos}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Video ôn tập bắt buộc:</span>
              <Badge variant="outline">{exercise.required_review_videos}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recap Dialog */}
      <RecapSubmissionDialog
        open={showRecapDialog}
        onOpenChange={setShowRecapDialog}
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        onSubmit={handleRecapSubmission}
      />
    </div>
  );
};

export default ExerciseContent;
