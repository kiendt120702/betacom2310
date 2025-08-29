import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { TrainingExercise } from "@/types/training";
import { useUserProfile } from "./useUserProfile";

export type SelectedPart = 'video' | 'quiz' | 'practice' | 'practice_test';

export const useTrainingLogic = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get("exercise");
  const partParam = searchParams.get("part") as SelectedPart | null;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(partParam || 'video');
  const [startTime, setStartTime] = useState<number>();

  const { data: userProfile } = useUserProfile();
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { 
    data: allUserExerciseProgress, 
    isLoading: progressLoading, 
    updateProgress, 
    isUpdating 
  } = useUserExerciseProgress();
  const { data: allSubmissions, isLoading: submissionsLoading } = useVideoReviewSubmissions();

  const orderedExercises = useMemo(() => 
    exercises?.sort((a, b) => a.order_index - b.order_index) || [], 
    [exercises]
  );

  const selectedExercise = useMemo(() => 
    orderedExercises.find((e) => e.id === selectedExerciseId), 
    [orderedExercises, selectedExerciseId]
  );

  const isVideoCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    const progress = allUserExerciseProgress.find(p => p.exercise_id === exerciseId);
    return !!progress?.video_completed;
  }, [allUserExerciseProgress]);

  const isLearningPartCompleted = useCallback((exerciseId: string): boolean => {
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;
    
    const progress = Array.isArray(allUserExerciseProgress) ? allUserExerciseProgress.find(p => p.exercise_id === exerciseId) : null;
    const videoStatus = exercise.exercise_video_url ? !!progress?.video_completed : true;
    const recapStatus = !!progress?.recap_submitted;
    
    return videoStatus && recapStatus;
  }, [orderedExercises, allUserExerciseProgress]);

  const isTheoryTestCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    const progress = allUserExerciseProgress.find(p => p.exercise_id === exerciseId);
    return !!progress?.quiz_passed;
  }, [allUserExerciseProgress]);

  const isPracticeCompleted = useCallback((exerciseId: string): boolean => {
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.min_review_videos === 0) return true;
    if (!Array.isArray(allSubmissions)) return false;
    const submissionCount = allSubmissions.filter(s => s.exercise_id === exerciseId).length;
    return submissionCount >= exercise.min_review_videos;
  }, [allSubmissions, orderedExercises]);

  const isPracticeTestCompleted = useCallback((exerciseId: string): boolean => {
    // Placeholder logic, will be implemented later.
    return false;
  }, []);

  const isExerciseCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    return allUserExerciseProgress.some(
      (progress) => progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  }, [allUserExerciseProgress]);

  const canCompleteExercise = useCallback((exerciseId: string): boolean => {
    return isLearningPartCompleted(exerciseId) && isTheoryTestCompleted(exerciseId) && isPracticeCompleted(exerciseId) && isPracticeTestCompleted(exerciseId);
  }, [isLearningPartCompleted, isTheoryTestCompleted, isPracticeCompleted, isPracticeTestCompleted]);

  const isExerciseUnlocked = useCallback((exerciseIndex: number): boolean => {
    // Check if user has full access
    const userRole = userProfile?.role?.trim().toLowerCase();
    const hasFullAccess =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'leader' ||
      userRole === 'trưởng phòng' ||
      userRole?.includes('admin') ||
      userRole?.includes('leader') ||
      userRole?.includes('trưởng phòng');

    if (hasFullAccess) return true;

    if (exerciseIndex === 0) return true;
    const previousExercise = orderedExercises[exerciseIndex - 1];
    if (!previousExercise) return false;
    
    // Next exercise unlocks after theory test completion of the previous exercise
    return isTheoryTestCompleted(previousExercise.id);
  }, [orderedExercises, isTheoryTestCompleted, userProfile]);

  const hasRecapSubmitted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    const progress = allUserExerciseProgress.find(p => p.exercise_id === exerciseId);
    return !!progress?.recap_submitted;
  }, [allUserExerciseProgress]);

  const isPartUnlocked = useCallback((exerciseId: string, part: SelectedPart): boolean => {
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    if (!exercise) return false;
    
    const exerciseIndex = orderedExercises.findIndex(e => e.id === exerciseId);
    if (!isExerciseUnlocked(exerciseIndex)) return false;

    // Check if user has full access
    const userRole = userProfile?.role?.trim().toLowerCase();
    const hasFullAccess =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'leader' ||
      userRole === 'trưởng phòng' ||
      userRole?.includes('admin') ||
      userRole?.includes('leader') ||
      userRole?.includes('trưởng phòng');

    if (hasFullAccess) return true;
    
    switch (part) {
      case 'video':
        // Video is always unlocked if the exercise is unlocked
        return true;
      case 'quiz':
        // Quiz is unlocked after video completion (80%) and recap submission
        const videoStatus = exercise.exercise_video_url ? isVideoCompleted(exerciseId) : true;
        const recapStatus = hasRecapSubmitted(exerciseId);
        return videoStatus && recapStatus;
      case 'practice_test':
        // Practice test is unlocked after theory test completion
        return isTheoryTestCompleted(exerciseId);
      case 'practice':
        // Practice (video review) is unlocked after theory test completion
        return isTheoryTestCompleted(exerciseId);
      default:
        return true;
    }
  }, [orderedExercises, isExerciseUnlocked, isVideoCompleted, hasRecapSubmitted, isTheoryTestCompleted, userProfile]);

  useEffect(() => {
    if (!selectedExerciseId && orderedExercises.length > 0 && !progressLoading) {
      const firstIncomplete = orderedExercises.find(
        (ex, index) => isExerciseUnlocked(index) && !isExerciseCompleted(ex.id)
      );
      const targetExercise = firstIncomplete || orderedExercises[0];
      setSelectedExerciseId(targetExercise.id);
      setSelectedPart('video');
    }
  }, [orderedExercises, selectedExerciseId, allUserExerciseProgress, progressLoading, isExerciseUnlocked, isExerciseCompleted]);

  useEffect(() => {
    if (selectedExerciseId && !startTime) {
      setStartTime(Date.now());
    }
  }, [selectedExerciseId, startTime]);

  const handleCompleteExercise = useCallback(() => {
    if (!selectedExerciseId || !canCompleteExercise(selectedExerciseId)) return;

    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 60000);
    
    updateProgress({
      exercise_id: selectedExerciseId,
      is_completed: true,
      time_spent: timeSpent,
    });
  }, [selectedExerciseId, canCompleteExercise, startTime, updateProgress]);

  const handleSelect = useCallback((exerciseId: string, part: SelectedPart) => {
    setSelectedExerciseId(exerciseId);
    setSelectedPart(part);
    setStartTime(Date.now());
  }, []);

  const isLoading = exercisesLoading || progressLoading || submissionsLoading;

  return {
    selectedExerciseId,
    selectedExercise,
    selectedPart,
    orderedExercises,
    isLoading,
    isCompletingExercise: isUpdating,
    isExerciseCompleted,
    isLearningPartCompleted,
    isVideoCompleted,
    isTheoryTestCompleted,
    isPracticeCompleted,
    isPracticeTestCompleted,
    canCompleteExercise,
    isExerciseUnlocked,
    isPartUnlocked,
    handleCompleteExercise,
    handleSelect,
  };
};