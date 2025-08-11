import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Video, CheckCircle, FileText, Save } from "lucide-react";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useSubmitRecap, useGetExerciseRecap } from "@/hooks/useExerciseRecaps";
import { secureLog } from "@/lib/utils";
import DOMPurify from "dompurify";

interface Exercise {
  id: string;
  title: string;
  description?: string;
  content?: string;
  exercise_video_url?: string;
  min_completion_time?: number;
  min_study_sessions?: number;
  min_review_videos?: number;
  required_review_videos?: number;
  is_required?: boolean;
  order_index?: number;
}

interface ExerciseContentProps {
  exercise: Exercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
}) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [recapContent, setRecapContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: progress,
    isLoading: progressLoading,
    updateProgress,
  } = useUserExerciseProgress(exercise.id);

  const { data: existingRecap } = useGetExerciseRecap(exercise.id);
  const submitRecap = useSubmitRecap();

  // Computed values - define these first before using in callbacks
  const isCompleted = progress?.is_completed || false;
  const hasWatchedVideo = progress?.video_completed || videoWatched;
  const hasSubmittedRecap = progress?.recap_submitted || false;
  const canComplete = hasWatchedVideo && hasSubmittedRecap && !isCompleted;

  // Load existing recap content when available
  useEffect(() => {
    if (existingRecap && existingRecap.recap_content !== recapContent) {
      setRecapContent(existingRecap.recap_content);
      setHasUnsavedChanges(false);
    }
  }, [existingRecap]);

  // Initialize session tracking
  useEffect(() => {
    const startTime = Date.now();
    setSessionStartTime(startTime);

    const interval = setInterval(() => {
      if (sessionStartTime) {
        const currentTime = Math.floor((Date.now() - sessionStartTime) / 1000);
        setTimeSpent(currentTime);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Save time spent when component unmounts
      if (sessionStartTime) {
        const finalTimeSpent = Math.floor(
          (Date.now() - sessionStartTime) / 1000
        );
        updateProgress({
          time_spent: (progress?.time_spent || 0) + finalTimeSpent,
        });
      }
    };
  }, [sessionStartTime, progress?.time_spent, updateProgress]);

  const handleVideoComplete = useCallback(() => {
    setVideoWatched(true);
    updateProgress({
      video_completed: true,
    });
  }, [updateProgress]);

  const handleRecapSubmit = useCallback(async () => {
    if (!recapContent.trim()) {
      return;
    }

    try {
      secureLog("Starting recap submission:", {
        exerciseId: exercise.id,
        contentLength: recapContent.trim().length,
      });

      // First submit the recap content
      const recapResult = await submitRecap.mutateAsync({
        exercise_id: exercise.id,
        recap_content: recapContent.trim(),
      });

      secureLog("Recap operation completed:", recapResult);
      setHasUnsavedChanges(false);

      // Then update progress separately to mark recap as submitted
      try {
        await updateProgress({
          recap_submitted: true,
        });
        secureLog("Progress updated successfully for recap submission");

        // Check if we can auto-complete the exercise
        const hasCompletedVideo = progress?.video_completed || videoWatched;
        if (hasCompletedVideo) {
          await updateProgress({
            is_completed: true,
            completed_at: new Date().toISOString(),
          });
          secureLog("Exercise marked as completed");
          onComplete?.();
        }
      } catch (progressError) {
        secureLog(
          "Error updating progress, but recap was saved:",
          progressError
        );
        // Don't throw error since recap was saved successfully
      }
    } catch (error) {
      secureLog("Error submitting recap:", error);
      throw error; // Let the mutation handle the error display
    }
  }, [
    recapContent,
    exercise.id,
    submitRecap,
    updateProgress,
    progress?.video_completed,
    videoWatched,
    onComplete,
  ]);

  const handleRecapChange = useCallback(
    (value: string) => {
      setRecapContent(value);
      setHasUnsavedChanges(value !== (existingRecap?.recap_content || ""));
    },
    [existingRecap?.recap_content]
  );

  const handleCompleteExercise = useCallback(async () => {
    if (!hasWatchedVideo || !hasSubmittedRecap) return;

    try {
      await updateProgress({
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
      onComplete?.();
    } catch (error) {
      secureLog("Error completing exercise:", error);
    }
  }, [hasWatchedVideo, hasSubmittedRecap, updateProgress, onComplete]);

  if (progressLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      {isCompleted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">🎉 Bài tập đã hoàn thành!</span>
          </div>
        </div>
      )}

      {/* Exercise Content */}
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title}</CardTitle>
          {exercise.description && (
            <p className="text-muted-foreground">{exercise.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {exercise.content && (
            <div className="prose max-w-none mb-6">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(exercise.content, {
                    ALLOWED_TAGS: [
                      "p",
                      "br",
                      "strong",
                      "em",
                      "u",
                      "h1",
                      "h2",
                      "h3",
                      "h4",
                      "h5",
                      "h6",
                      "ul",
                      "ol",
                      "li",
                      "blockquote",
                      "a",
                    ],
                    ALLOWED_ATTR: ["href", "title", "target"],
                    ALLOW_DATA_ATTR: false,
                    FORBID_SCRIPTS: true,
                    FORBID_TAGS: [
                      "script",
                      "style",
                      "iframe",
                      "object",
                      "embed",
                      "form",
                      "input",
                      "button",
                    ],
                  }),
                }}
              />
            </div>
          )}

          {exercise.exercise_video_url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video bài tập
              </h3>
              <div className="aspect-video">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  onEnded={handleVideoComplete}
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}>
                  <source src={exercise.exercise_video_url} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Recap Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recap-textarea">Nội dung</Label>
            <Textarea
              id="recap-textarea"
              placeholder="Ghi chú những điều quan trọng trong video và tóm tắt những kiến thức bạn đã học được từ bài này..."
              value={recapContent}
              onChange={(e) => handleRecapChange(e.target.value)}
              disabled={!hasWatchedVideo}
              rows={6}
              className="mt-2"
            />
            <div className="flex justify-between items-center mt-2">
              {hasUnsavedChanges && (
                <p className="text-xs text-orange-600">Có thay đổi chưa lưu</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleRecapSubmit}
              disabled={
                !hasWatchedVideo ||
                !recapContent.trim() ||
                submitRecap.isPending ||
                (!hasUnsavedChanges && hasSubmittedRecap)
              }
              className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {submitRecap.isPending
                ? "Đang lưu..."
                : hasSubmittedRecap
                ? "Cập nhật recap"
                : "Lưu recap"}
            </Button>

            {hasSubmittedRecap && !isCompleted && (
              <Button
                onClick={handleCompleteExercise}
                disabled={!canComplete}
                className="flex items-center gap-2"
                variant="default">
                <CheckCircle className="w-4 h-4" />
                Hoàn thành bài tập
              </Button>
            )}

            {isCompleted && (
              <Button
                disabled
                className="flex items-center gap-2"
                variant="outline">
                <CheckCircle className="w-4 h-4" />
                Đã hoàn thành
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseContent;