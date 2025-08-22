import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrainingVideo from "./TrainingVideo";
import RecapTextArea from "./RecapTextArea";
import { useRecapManager } from "@/hooks/useRecapManager";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { TrainingExercise } from "@/types/training";
import { formatLearningTime } from "@/utils/learningUtils";

const secureLog = (message: string, data?: any) => {
  if (typeof window !== "undefined" && window.console) {
    console.log(`[ExerciseContent] ${message}`, data);
  }
};

interface ExerciseContentProps {
  exercise: TrainingExercise;
  onComplete?: () => void;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const sessionTimeSpentRef = useRef(0);

  const {
    data: userProgress,
    updateProgress,
    isLoading: progressLoading,
  } = useUserExerciseProgress(exercise.id);

  const recapManager = useRecapManager({
    exerciseId: exercise.id,
    onRecapSubmitted: () => {
      secureLog("Recap submitted successfully for exercise", exercise.id);
    },
  });

  const isCompleted = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.is_completed : false) || false,
    [userProgress]
  );

  const canCompleteExercise = useMemo(
    () => recapManager.hasSubmitted && !isCompleted,
    [recapManager.hasSubmitted, isCompleted]
  );

  const saveTimeSpent = useCallback(async (seconds: number) => {
    if (seconds > 0) {
      const minutes = Math.round(seconds / 60);
      if (minutes > 0) {
        secureLog(`Saving ${minutes} minute(s) of watch time for exercise`, exercise.id);
        await updateProgress({
          exercise_id: exercise.id,
          time_spent: minutes,
        });
      }
    }
  }, [updateProgress, exercise.id]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (sessionTimeSpentRef.current > 0) {
        saveTimeSpent(sessionTimeSpentRef.current);
        sessionTimeSpentRef.current = 0; // Reset after saving
      }
    }, 30000); // Save every 30 seconds

    return () => {
      clearInterval(saveInterval);
      saveTimeSpent(sessionTimeSpentRef.current); // Save any remaining time on unmount
    };
  }, [saveTimeSpent]);

  const handleSaveTimeSpent = useCallback((seconds: number) => {
    sessionTimeSpentRef.current += seconds;
  }, []);

  const handleVideoComplete = useCallback(() => {
    setHasWatchedVideo(true);
    secureLog("Video marked as watched");

    updateProgress({
      exercise_id: exercise.id,
      video_completed: true,
    });
  }, [updateProgress, exercise.id]);

  const handleCompleteExercise = useCallback(async () => {
    if (!canCompleteExercise) return;

    try {
      secureLog("Completing exercise", { exerciseId: exercise.id });

      // Save any remaining time before marking as complete
      await saveTimeSpent(sessionTimeSpentRef.current);
      sessionTimeSpentRef.current = 0;

      await updateProgress({
        exercise_id: exercise.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });

      toast({
        title: "Hoàn thành bài tập",
        description: "Bài tập đã hoàn thành! Đang chuyển sang bài tiếp theo...",
      });

      if (onComplete) {
        onComplete();
      }

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
  }, [canCompleteExercise, exercise.id, updateProgress, onComplete, toast, queryClient, saveTimeSpent]);

  const timeSpent = (userProgress && !Array.isArray(userProgress) ? userProgress.time_spent : 0) || 0;

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
    <div className="space-y-4 md:space-y-6 max-w-none">
      {/* Exercise Title */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{exercise.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          {isCompleted && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Đã hoàn thành</span>
            </div>
          )}
          {timeSpent > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tổng thời gian đã xem bài học: {formatLearningTime(timeSpent)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video Section - Always show if video URL exists */}
      {exercise.exercise_video_url && (
        <div className="w-full">
          <TrainingVideo
            videoUrl={exercise.exercise_video_url}
            title={exercise.title}
            isCompleted={isCompleted}
            onVideoComplete={handleVideoComplete}
            onProgress={(progress) => {
              secureLog('Video progress:', progress);
            }}
            onSaveTimeSpent={handleSaveTimeSpent}
          />
        </div>
      )}

      {/* Content Section - REMOVED, now handled by TheoryView */}

      {/* Recap Section - Always show */}
      <div className="w-full">
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
      </div>

      {/* Complete Exercise Button */}
      <div className="flex justify-center pt-4">
        {canCompleteExercise ? (
          <Button
            onClick={handleCompleteExercise}
            className="w-full md:w-auto px-6 md:px-8 py-2"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Hoàn thành bài tập
          </Button>
        ) : isCompleted ? (
          <Button disabled className="w-full md:w-auto px-6 md:px-8 py-2" size="lg" variant="outline">
            <CheckCircle className="h-5 w-5 mr-2" />
            Đã hoàn thành
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ExerciseContent;