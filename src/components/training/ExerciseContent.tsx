import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Play, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoSubmissionDialog from "@/components/video/VideoSubmissionDialog";
import { useGetExerciseRecap, useSubmitRecap } from "@/hooks/useExerciseRecaps";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import DOMPurify from "dompurify";
import { EduExercise } from "@/types/training";

// Safe logging function
const secureLog = (message: string, data?: any) => {
  if (typeof window !== "undefined" && window.console) {
    console.log(`[ExerciseContent] ${message}`, data);
  }
};

interface ExerciseContentProps {
  exercise: EduExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
}) => {
  const { toast } = useToast();
  const [recapContent, setRecapContent] = useState("");
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hooks for data management
  const {
    data: userProgress,
    updateProgress,
    isLoading: progressLoading,
  } = useUserExerciseProgress(exercise.id);

  const { data: existingRecap, isLoading: recapLoading } = useGetExerciseRecap(
    exercise.id
  );

  const submitRecap = useSubmitRecap();

  // Memoized values
  const hasSubmittedRecap = useMemo(
    () => Boolean(existingRecap?.submitted_at),
    [existingRecap?.submitted_at]
  );

  const isCompleted = useMemo(
    () => userProgress?.is_completed || false,
    [userProgress?.is_completed]
  );

  // Check if exercise can be completed (has submitted recap)
  const canCompleteExercise = useMemo(
    () => hasSubmittedRecap && !isCompleted,
    [hasSubmittedRecap, isCompleted]
  );

  // Load existing recap content
  useEffect(() => {
    if (existingRecap?.recap_content && !recapContent) {
      setRecapContent(existingRecap.recap_content);
      secureLog("Loaded existing recap content");
    }
  }, [existingRecap?.recap_content, recapContent]);

  // Handle video completion
  const handleVideoComplete = useCallback(() => {
    setHasWatchedVideo(true);
    secureLog("Video marked as watched");

    // Update progress to reflect video completion
    updateProgress({
      exercise_id: exercise.id,
      video_completed: true,
    });
  }, [updateProgress, exercise.id]);

  const handleRecapSubmit = useCallback(async () => {
    if (!recapContent.trim()) {
      return;
    }

    try {
      secureLog("Submitting recap", { exerciseId: exercise.id });

      // Submit recap
      await submitRecap.mutateAsync({
        exercise_id: exercise.id,
        recap_content: recapContent.trim(),
      });

      setHasUnsavedChanges(false);

      // Update progress to mark recap as submitted
      await updateProgress({
        exercise_id: exercise.id,
        recap_submitted: true,
      });
    } catch (error) {
      secureLog("Recap submission error:", error);
      // Error handling is done in the hook
    }
  }, [exercise.id, recapContent, submitRecap, updateProgress]);

  const handleCompleteExercise = useCallback(async () => {
    if (!canCompleteExercise) return;

    try {
      secureLog("Completing exercise", { exerciseId: exercise.id });

      // Mark exercise as completed
      await updateProgress({
        exercise_id: exercise.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      if (onComplete) {
        onComplete();
      }

      toast({
        title: "Hoàn thành bài tập",
        description: "Bạn đã hoàn thành bài tập thành công!",
      });
    } catch (error) {
      secureLog("Complete exercise error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể hoàn thành bài tập",
        variant: "destructive",
      });
    }
  }, [canCompleteExercise, exercise.id, updateProgress, onComplete, toast]);

  const handleRecapChange = useCallback(
    (value: string) => {
      setRecapContent(value);
      setHasUnsavedChanges(value !== (existingRecap?.recap_content || ""));
    },
    [existingRecap?.recap_content]
  );

  const sanitizedContent = useMemo(() => {
    if (!exercise.content) return "";

    return DOMPurify.sanitize(exercise.content, {
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
    });
  }, [exercise.content]);

  if (progressLoading || recapLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-5 w-5" />
          <Badge variant="outline">Tiêu đề bài học</Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã hoàn thành
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold">{exercise.title}</h1>
      </div>

      {/* Video Section */}
      {(exercise.video_url || exercise.exercise_video_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video mb-4">
              <iframe
                src={exercise.video_url || exercise.exercise_video_url}
                className="w-full h-full rounded-lg border"
                allowFullScreen
                onLoad={() => handleVideoComplete()}
              />
            </div>
            {exercise.requires_submission && (
              <VideoSubmissionDialog
                exerciseId={exercise.id}
                exerciseTitle={exercise.title}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Section */}
      {sanitizedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nội dung bài học</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </CardContent>
        </Card>
      )}

      {/* Recap Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recap</CardTitle>
            {hasSubmittedRecap && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Đã nộp
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={recapContent}
            onChange={(e) => handleRecapChange(e.target.value)}
            placeholder="Hãy viết tóm tắt những gì bạn đã học được từ bài học này..."
            className="min-h-[150px]"
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges && "Có thay đổi chưa lưu"}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRecapSubmit}
                disabled={
                  !hasWatchedVideo ||
                  !recapContent.trim() ||
                  submitRecap.isPending ||
                  (!hasUnsavedChanges && hasSubmittedRecap && !isCompleted)
                }
                variant="outline"
                className="min-w-[100px]">
                {submitRecap.isPending ? (
                  "Đang gửi..."
                ) : hasSubmittedRecap && !hasUnsavedChanges ? (
                  "Cập nhật recap"
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi recap
                  </>
                )}
              </Button>

              {/* Complete Exercise Button */}
              <Button
                onClick={handleCompleteExercise}
                disabled={!canCompleteExercise}
                className="min-w-[140px]">
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đã hoàn thành
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Hoàn thành bài tập
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseContent;