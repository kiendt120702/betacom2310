import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrainingVideo from "./TrainingVideo";
import RecapTextArea from "./RecapTextArea";
import { useRecapManager } from "@/hooks/useRecapManager";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);

  // Hooks for data management
  const {
    data: userProgress,
    updateProgress,
    isLoading: progressLoading,
  } = useUserExerciseProgress(exercise.id);

  // Recap management
  const recapManager = useRecapManager({
    exerciseId: exercise.id,
    onRecapSubmitted: () => {
      secureLog("Recap submitted successfully for exercise", exercise.id);
    },
  });

  // Memoized values
  const isCompleted = useMemo(
    () => userProgress?.is_completed || false,
    [userProgress?.is_completed]
  );

  // Check if exercise can be completed (has submitted recap)
  const canCompleteExercise = useMemo(
    () => recapManager.hasSubmitted && !isCompleted,
    [recapManager.hasSubmitted, isCompleted]
  );

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

      // Invalidate queries to ensure immediate UI updates
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });

      // Show success toast
      toast({
        title: "Hoàn thành bài tập",
        description: "Bài tập đã hoàn thành! Đang chuyển sang bài tiếp theo...",
      });

      // Call onComplete to trigger sidebar refresh and next exercise
      if (onComplete) {
        onComplete();
      }

      // Small delay for better UX, then let parent component handle navigation
      setTimeout(() => {
        secureLog("Exercise completion callback triggered");
      }, 500);

    } catch (error) {
      secureLog("Complete exercise error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể hoàn thành bài tập",
        variant: "destructive",
      });
    }
  }, [canCompleteExercise, exercise.id, updateProgress, onComplete, toast, queryClient]);


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

  if (progressLoading || recapManager.isLoading) {
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
      {/* Video Section */}
      {(exercise.video_url || exercise.exercise_video_url) && (
        <TrainingVideo
          videoUrl={exercise.video_url || exercise.exercise_video_url || ''}
          title={exercise.title}
          isCompleted={isCompleted}
          onVideoComplete={handleVideoComplete}
          onProgress={(progress) => {
            secureLog('Video progress:', progress);
          }}
        />
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
      <RecapTextArea
        content={recapManager.content}
        onContentChange={recapManager.handleContentChange}
        onSubmit={recapManager.handleSubmit}
        isSubmitting={recapManager.isSubmitting}
        hasSubmitted={recapManager.hasSubmitted}
        hasUnsavedChanges={recapManager.hasUnsavedChanges}
        canSubmit={recapManager.canSubmit}
        disabled={false}
      />

      {/* Complete Exercise Button */}
      {canCompleteExercise && (
        <div className="flex justify-center">
          <Button
            onClick={handleCompleteExercise}
            className="px-8 py-2"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Hoàn thành bài tập
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="flex justify-center">
          <Button disabled className="px-8 py-2" size="lg" variant="outline">
            <CheckCircle className="h-5 w-5 mr-2" />
            Đã hoàn thành
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseContent;