import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { TrainingExercise } from "@/types/training";
import { useUserProfile } from "./useUserProfile";

export type SelectedPart = 'video' | 'quiz' | 'practice';

interface ProgressMap {
  [exerciseId: string]: {
    isCompleted: boolean;
    videoCompleted: boolean;
    quizPassed: boolean;
    recapSubmitted: boolean;
    practiceCompleted: boolean;
    theoryRead: boolean;
  }
}

interface UnlockMap {
  [exerciseId: string]: {
    exercise: boolean;
    video: boolean;
    quiz: boolean;
    practice: boolean;
  }
}

export const useOptimizedTrainingLogic = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get("exercise");
  const partParam = searchParams.get("part") as SelectedPart | null;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(partParam || 'video');
  
  const { data: userProfile } = useUserProfile();

  // Data fetching hooks
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { 
    data: allUserExerciseProgress, 
    isLoading: progressLoading, 
    updateProgress, 
    isUpdating 
  } = useUserExerciseProgress();
  const { data: allSubmissions, isLoading: submissionsLoading } = useVideoReviewSubmissions();

  // Memoized ordered exercises
  const orderedExercises = useMemo(() => 
    exercises?.sort((a, b) => a.order_index - b.order_index) || [], 
    [exercises]
  );

  const defaultProgress = {
    isCompleted: false,
    videoCompleted: false,
    quizPassed: false,
    recapSubmitted: false,
    practiceCompleted: false,
    theoryRead: false,
  };

  // Memoized progress map for performance
  const progressMap = useMemo((): ProgressMap => {
    const map: ProgressMap = {};
    
    if (!Array.isArray(allUserExerciseProgress)) return map;
    
    orderedExercises.forEach(exercise => {
      const progress = allUserExerciseProgress.find(p => p.exercise_id === exercise.id);
      const submissionCount = Array.isArray(allSubmissions) 
        ? allSubmissions.filter(s => s.exercise_id === exercise.id).length 
        : 0;
      
      map[exercise.id] = {
        isCompleted: !!progress?.is_completed,
        videoCompleted: !!progress?.video_completed,
        quizPassed: !!progress?.quiz_passed,
        recapSubmitted: !!progress?.recap_submitted,
        practiceCompleted: submissionCount >= (exercise.min_review_videos || 0),
        theoryRead: !!progress?.theory_read,
      };
    });
    
    return map;
  }, [allUserExerciseProgress, allSubmissions, orderedExercises]);

  // Memoized unlock map for performance
  const unlockMap = useMemo((): UnlockMap => {
    const map: UnlockMap = {};

    const userRole = userProfile?.role?.trim().toLowerCase();
    const hasFullAccess =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'leader' ||
      userRole === 'trưởng phòng' ||
      userRole?.includes('admin') ||
      userRole?.includes('leader') ||
      userRole?.includes('trưởng phòng');

    if (hasFullAccess) {
      orderedExercises.forEach(exercise => {
        map[exercise.id] = {
          exercise: true,
          video: true,
          quiz: true,
          practice: true,
        };
      });
      return map;
    }
    
    orderedExercises.forEach((exercise, index) => {
      const previousExercise = index > 0 ? orderedExercises[index - 1] : null;
      let isUnlocked = false;
      if (index === 0) {
          isUnlocked = true;
      } else if (previousExercise) {
          isUnlocked = (progressMap[previousExercise.id] || defaultProgress).quizPassed;
      }

      const exerciseProgress = progressMap[exercise.id] || defaultProgress;
      map[exercise.id] = {
          exercise: isUnlocked,
          video: isUnlocked,
          quiz: isUnlocked && exerciseProgress.theoryRead,
          practice: isUnlocked && exerciseProgress.quizPassed,
      };
    });
    return map;
  }, [orderedExercises, progressMap, userProfile]);

  // Selected exercise
  const selectedExercise = useMemo(() => 
    orderedExercises.find((e) => e.id === selectedExerciseId), 
    [orderedExercises, selectedExerciseId]
  );

  // Optimized checker functions using memoized maps
  const isExerciseUnlocked = useCallback((exerciseId: string): boolean => {
    return unlockMap[exerciseId]?.exercise || false;
  }, [unlockMap]);

  const isPartUnlocked = useCallback((exerciseId: string, part: SelectedPart): boolean => {
    return unlockMap[exerciseId]?.[part] || false;
  }, [unlockMap]);

  const isExerciseCompleted = useCallback((exerciseId: string): boolean => {
    return progressMap[exerciseId]?.isCompleted || false;
  }, [progressMap]);

  const isVideoCompleted = useCallback((exerciseId: string): boolean => {
    return progressMap[exerciseId]?.videoCompleted || false;
  }, [progressMap]);

  const isTheoryTestCompleted = useCallback((exerciseId: string): boolean => {
    return progressMap[exerciseId]?.quizPassed || false;
  }, [progressMap]);

  const isPracticeCompleted = useCallback((exerciseId: string): boolean => {
    return progressMap[exerciseId]?.practiceCompleted || false;
  }, [progressMap]);

  const isLearningPartCompleted = useCallback((exerciseId: string): boolean => {
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;
    
    const progress = progressMap[exerciseId] || defaultProgress;
    const videoStatus = exercise.exercise_video_url ? progress.videoCompleted : true;
    const recapStatus = progress.recapSubmitted;
    
    return videoStatus && recapStatus;
  }, [orderedExercises, progressMap]);

  // Auto-select first available exercise
  useEffect(() => {
    if (!selectedExerciseId && orderedExercises.length > 0 && !progressLoading) {
      const firstIncomplete = orderedExercises.find(
        (ex) => isExerciseUnlocked(ex.id) && !isExerciseCompleted(ex.id)
      );
      const targetExercise = firstIncomplete || orderedExercises[0];
      setSelectedExerciseId(targetExercise.id);
      setSelectedPart('video');
    }
  }, [orderedExercises, selectedExerciseId, progressLoading, isExerciseUnlocked, isExerciseCompleted]);

  // Handle selection with validation
  const handleSelect = useCallback((exerciseId: string, part: SelectedPart) => {
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    if (!isExerciseUnlocked(exerciseId) || !isPartUnlocked(exerciseId, part)) {
      return;
    }
    
    setSelectedExerciseId(exerciseId);
    setSelectedPart(part);
  }, [isExerciseUnlocked, isPartUnlocked, orderedExercises]);

  const isLoading = exercisesLoading || progressLoading || submissionsLoading;

  return {
    // Selection state
    selectedExerciseId,
    selectedExercise,
    selectedPart,
    
    // Data
    orderedExercises,
    progressMap,
    unlockMap,
    
    // Loading state
    isLoading,
    isCompletingExercise: isUpdating,
    
    // Checker functions
    isExerciseCompleted,
    isExerciseUnlocked,
    isVideoCompleted,
    isTheoryTestCompleted,
    isPracticeCompleted,
    isLearningPartCompleted,
    isPartUnlocked,
    
    // Actions
    handleSelect,
    updateProgress,
  };
};