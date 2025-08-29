import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { TrainingExercise } from "@/types/training";
import { useUserProfile } from "./useUserProfile"; // Import useUserProfile

export type SelectedPart = 'video' | 'quiz' | 'practice' | 'practice_test';

interface ProgressMap {
  [exerciseId: string]: {
    isCompleted: boolean;
    videoCompleted: boolean;
    quizPassed: boolean;
    recapSubmitted: boolean;
    practiceCompleted: boolean;
    practiceTestCompleted: boolean;
  }
}

interface UnlockMap {
  [exerciseId: string]: {
    exercise: boolean;
    video: boolean;
    quiz: boolean;
    practice: boolean;
    practice_test: boolean;
  }
}

export const useOptimizedTrainingLogic = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get("exercise");
  const partParam = searchParams.get("part") as SelectedPart | null;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(partParam || 'video');
  
  const { data: userProfile } = useUserProfile(); // Get user profile

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
        practiceTestCompleted: false, // Placeholder
      };
    });
    
    return map;
  }, [allUserExerciseProgress, allSubmissions, orderedExercises]);

  const defaultProgress = {
    isCompleted: false,
    videoCompleted: false,
    quizPassed: false,
    recapSubmitted: false,
    practiceCompleted: false,
    practiceTestCompleted: false,
  };

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
      // If user has full access, unlock everything
      orderedExercises.forEach(exercise => {
        map[exercise.id] = {
          exercise: true,
          video: true,
          quiz: true,
          practice: true,
          practice_test: true,
        };
      });
      return map;
    }
    
    orderedExercises.forEach((exercise, index) => {
      const exerciseProgress = progressMap[exercise.id] || defaultProgress;
      
      // Exercise unlock logic: first exercise or previous exercise theory test completed
      const isExerciseUnlocked = index === 0 || 
        (orderedExercises[index - 1] && (progressMap[orderedExercises[index - 1].id] || defaultProgress).quizPassed);
      
      // Part unlock logic following the correct learning flow
      const videoUnlocked = isExerciseUnlocked;
      const quizUnlocked = isExerciseUnlocked && 
        (exercise.exercise_video_url ? exerciseProgress.videoCompleted : true) && 
        exerciseProgress.recapSubmitted;
      const practiceUnlocked = isExerciseUnlocked && exerciseProgress.quizPassed;
      const practiceTestUnlocked = isExerciseUnlocked && exerciseProgress.quizPassed;
      
      map[exercise.id] = {
        exercise: isExerciseUnlocked,
        video: videoUnlocked,
        quiz: quizUnlocked,
        practice: practiceUnlocked,
        practice_test: practiceTestUnlocked,
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

  const isPracticeTestCompleted = useCallback((exerciseId: string): boolean => {
    return progressMap[exerciseId]?.practiceTestCompleted || false;
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
    // Only allow selection if unlocked
    if (!isExerciseUnlocked(exerciseId) || !isPartUnlocked(exerciseId, part)) {
      return;
    }
    
    setSelectedExerciseId(exerciseId);
    setSelectedPart(part);
  }, [isExerciseUnlocked, isPartUnlocked]);

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
    isPracticeTestCompleted,
    isLearningPartCompleted,
    isPartUnlocked,
    
    // Actions
    handleSelect,
    updateProgress,
  };
};