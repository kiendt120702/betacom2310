
import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, CheckCircle2, FileText, AlertCircle, Clock } from "lucide-react";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import RecapSubmissionDialog from "./RecapSubmissionDialog";
import type { EduExercise } from "@/hooks/useEduExercises";
import { useVideoTracking, useUpdateVideoTracking, formatWatchTime } from "@/hooks/useVideoTracking";

interface ExerciseContentProps {
  exercise: EduExercise;
  isCompleted: boolean;
  isVideoCompleted: boolean;
  isRecapSubmitted: boolean;
  canCompleteExercise: boolean;
  onComplete: () => void;
  onRecapSubmitted: () => void;
  isCompletingExercise?: boolean;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  isCompleted,
  isRecapSubmitted,
  canCompleteExercise,
  onComplete,
  onRecapSubmitted,
  isCompletingExercise = false,
}) => {
  const { data: videoTracking } = useVideoTracking(exercise.id);
  const updateVideoTracking = useUpdateVideoTracking();

  const handleTimeTracking = useCallback((trackingData: {
    currentTime: number;
    duration: number;
    watchedPercentage: number;
    totalWatchTime: number;
  }) => {
    // Update tracking every 30 seconds to avoid too frequent updates
    if (Math.floor(trackingData.currentTime) % 30 === 0) {
      updateVideoTracking.mutate({
        exercise_id: exercise.id,
        total_watch_time: trackingData.totalWatchTime,
        video_duration: trackingData.duration,
        watch_percentage: trackingData.watchedPercentage,
        last_position: trackingData.currentTime,
      });
    }
  }, [exercise.id, updateVideoTracking]);
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Exercise Video Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" aria-hidden="true" />
                <span>{exercise.title}</span>
              </CardTitle>
              {isCompleted && (
                <Badge 
                  variant="default" 
                  className="bg-green-500"
                  aria-label="Bài tập đã hoàn thành"
                >
                  <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                  Hoàn thành
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {exercise.exercise_video_url ? (
              <div className="space-y-4">
                <SecureVideoPlayer
                  videoUrl={exercise.exercise_video_url}
                  title={exercise.title}
                  onTimeTracking={handleTimeTracking}
                />
                
                {/* Video Statistics */}
                {videoTracking && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Thống kê xem video</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Thời gian xem</p>
                        <p className="font-medium">{formatWatchTime(videoTracking.total_watch_time)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tiến độ</p>
                        <p className="font-medium">{videoTracking.watch_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Số lần xem</p>
                        <p className="font-medium">{videoTracking.session_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vị trí cuối</p>
                        <p className="font-medium">{formatWatchTime(videoTracking.last_position)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NoVideoContent />
            )}
          </CardContent>
        </Card>

        {/* Recap Section */}
        {!isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gửi tóm tắt bài học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hãy viết tóm tắt những kiến thức chính mà bạn đã học được từ bài học này để hoàn thành bài tập.
                </p>
                
                <div className="flex items-center justify-center">
                  <RecapSubmissionDialog
                    exerciseId={exercise.id}
                    exerciseTitle={exercise.title}
                    onRecapSubmitted={onRecapSubmitted}
                  >
                    <Button
                      variant={isRecapSubmitted ? "outline" : "default"}
                      className={isRecapSubmitted ? "bg-green-50 border-green-200" : ""}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isRecapSubmitted ? "Đã gửi recap - Xem lại" : "Gửi tóm tắt"}
                    </Button>
                  </RecapSubmissionDialog>
                </div>

                {isRecapSubmitted && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Recap đã được gửi</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Button - Always show but disabled when requirements not met */}
        {!isCompleted && (
          <div className="flex justify-center">
            <Button
              onClick={onComplete}
              className={`transition-colors ${
                canCompleteExercise 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              size="lg"
              disabled={!canCompleteExercise || isCompletingExercise}
              aria-describedby="complete-button-description"
              title={
                !canCompleteExercise 
                  ? "Vui lòng gửi tóm tắt bài học trước khi hoàn thành" 
                  : "Nhấn để hoàn thành bài tập"
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
              {isCompletingExercise ? "Đang xử lý..." : "Hoàn thành bài tập"}
            </Button>
            <div id="complete-button-description" className="sr-only">
              {canCompleteExercise 
                ? "Nhấn để đánh dấu bài tập này là đã hoàn thành"
                : "Cần gửi tóm tắt bài học trước khi có thể hoàn thành bài tập này"
              }
            </div>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="flex justify-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" aria-hidden="true" />
              <p className="text-green-700 font-medium">Bài tập đã hoàn thành!</p>
              <p className="text-green-600 text-sm mt-1">
                Bạn có thể tiếp tục với bài tập tiếp theo
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const NoVideoContent: React.FC = () => (
  <div className="text-center py-8 text-muted-foreground">
    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
    <p>Chưa có video bài học cho bài tập này.</p>
    <p className="text-sm mt-2 opacity-75">
      Video sẽ được cập nhật sớm nhất có thể.
    </p>
  </div>
);

export default ExerciseContent;
