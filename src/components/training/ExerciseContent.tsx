import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrainingVideo from "./TrainingVideo";
import RecapTextArea from "./RecapTextArea";
import { useRecapManager } from "@/hooks/useRecapManager";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { TrainingExercise } from "@/types/training";
import { formatLearningTime } from "@/utils/learningUtils";
import { supabase } from "@/integrations/supabase/client";

import { logger } from "@/lib/logger";

interface ExerciseContentProps {
  exercise: TrainingExercise;
  onComplete?: () => void;
  isLearningPartCompleted: boolean;
}

const ExerciseContent: React.FC<ExerciseContentProps> = ({
  exercise,
  onComplete,
  isLearningPartCompleted,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const sessionTimeSpentRef = useRef(0);

  const {
    data: userProgress,
    updateProgress,
    isLoading: progressLoading,
    isUpdating,
  } = useUserExerciseProgress(exercise.id);

  const recapManager = useRecapManager({
    exerciseId: exercise.id,
    onRecapSubmitted: () => {
      logger.info("Recap submitted successfully for exercise", { exerciseId: exercise.id }, "ExerciseContent");
    },
  });

  const isCompleted = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.is_completed : false) || false,
    [userProgress]
  );

  const isVideoCompleted = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.video_completed : false) || false,
    [userProgress]
  );

  const isTheoryRead = useMemo(
    () => (userProgress && !Array.isArray(userProgress) ? userProgress.theory_read : false) || false,
    [userProgress]
  );

  const timeSpent = (userProgress && !Array.isArray(userProgress) ? userProgress.time_spent : 0) || 0;

  const canCompleteExercise = useMemo(
    () => (hasWatchedVideo || isVideoCompleted) && recapManager.hasSubmitted && !isCompleted,
    [hasWatchedVideo, isVideoCompleted, recapManager.hasSubmitted, isCompleted]
  );

  const saveTimeSpent = useCallback(async (seconds: number) => {
    if (seconds > 0) {
      const minutes = Math.round(seconds / 60);
      if (minutes > 0) {
        logger.debug(`Saving ${minutes} minute(s) of watch time`, { exerciseId: exercise.id, minutes }, "ExerciseContent");
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

  const handleVideoComplete = useCallback(async () => {
    setHasWatchedVideo(true);
    logger.info("Video marked as watched", { exerciseId: exercise.id }, "ExerciseContent");

    // Increment video view count using direct RPC call
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (user?.user?.id) {
        const { data, error } = await supabase.rpc('increment_video_view_count', {
          p_user_id: user.user.id,
          p_exercise_id: exercise.id
        });
        
        if (error) {
          logger.error('Error incrementing video view count', { error, exerciseId: exercise.id }, "ExerciseContent");
        } else {
          logger.info(`Video view count incremented`, { count: data, exerciseId: exercise.id }, "ExerciseContent");
          
          // Invalidate relevant queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
        }
      }
    } catch (error) {
      logger.error('Failed to increment video view count', { error, exerciseId: exercise.id }, "ExerciseContent");
    }

    updateProgress({
      exercise_id: exercise.id,
      video_completed: true,
    });
  }, [updateProgress, exercise.id, queryClient]);

  const handleMarkLearningComplete = useCallback(async () => {
    if (isLearningPartCompleted && !isTheoryRead) {
      await updateProgress({
        exercise_id: exercise.id,
        theory_read: true,
      });
      toast({
        title: "Hoàn thành phần học",
        description: "Phần kiểm tra lý thuyết đã được mở khóa.",
      });
    }
  }, [isLearningPartCompleted, isTheoryRead, updateProgress, exercise.id, toast]);

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
      {/* Video Section */}
      {exercise.exercise_video_url ? (
        <div className="w-full">
          <TrainingVideo
            videoUrl={exercise.exercise_video_url}
            title={exercise.title}
            exerciseId={exercise.id}
            requiredViewingCount={exercise.required_viewing_count}
            isCompleted={isCompleted}
            onVideoComplete={handleVideoComplete}
            onProgress={(progress) => {
              logger.debug('Video progress update', { progress, exerciseId: exercise.id }, "ExerciseContent");
            }}
            onSaveTimeSpent={handleSaveTimeSpent}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nội dung video sẽ được cập nhật sớm.</p>
          </CardContent>
        </Card>
      )}

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

      {isLearningPartCompleted && !isTheoryRead && (
        <Card className="mt-4">
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Bạn đã hoàn thành phần học video và recap.</p>
            <Button onClick={handleMarkLearningComplete} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Đánh dấu hoàn thành & Mở khóa bài test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseContent;