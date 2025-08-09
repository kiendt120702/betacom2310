
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises, useUserExerciseProgress, useUpdateExerciseProgress } from "@/hooks/useEduExercises";

/**
 * Custom hook to manage training content logic
 * Separates business logic from UI components
 */
export const useTrainingLogic = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get("exercise");

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [startTime, setStartTime] = useState<number>();

  // Data hooks
  const { data: exercises, isLoading: exercisesLoading } = useEduExercises();
  const { data: userExerciseProgress, isLoading: progressLoading } = useUserExerciseProgress();
  const { mutate: updateExerciseProgress, isPending: isCompletingExercise } = useUpdateExerciseProgress();

  // Memoized computations for better performance
  const orderedExercises = useMemo(() => 
    exercises?.sort((a, b) => a.order_index - b.order_index) || [], 
    [exercises]
  );

  const selectedExercise = useMemo(() => 
    exercises?.find((e) => e.id === selectedExerciseId), 
    [exercises, selectedExerciseId]
  );

  // Helper functions
  const isExerciseCompleted = useCallback((exerciseId: string): boolean => {
    return userExerciseProgress?.some(
      (progress) => progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  }, [userExerciseProgress]);

  const isVideoCompleted = useCallback((exerciseId: string): boolean => {
    return userExerciseProgress?.some(
      (progress) => progress.exercise_id === exerciseId && progress.video_completed
    ) || false;
  }, [userExerciseProgress]);

  const isRecapSubmitted = useCallback((exerciseId: string): boolean => {
    return userExerciseProgress?.some(
      (progress) => progress.exercise_id === exerciseId && progress.recap_submitted
    ) || false;
  }, [userExerciseProgress]);

  const canCompleteExercise = useCallback((exerciseId: string): boolean => {
    return isVideoCompleted(exerciseId) && isRecapSubmitted(exerciseId);
  }, [isVideoCompleted, isRecapSubmitted]);

  const isExerciseUnlocked = useCallback((exerciseIndex: number): boolean => {
    if (exerciseIndex === 0) return true;
    
    const previousExercise = orderedExercises[exerciseIndex - 1];
    return previousExercise ? isExerciseCompleted(previousExercise.id) : false;
  }, [orderedExercises, isExerciseCompleted]);

  // Auto-select logic
  useEffect(() => {
    if (!selectedExerciseId && orderedExercises.length > 0 && !progressLoading) {
      // Find first incomplete exercise or first exercise
      const firstIncomplete = orderedExercises.find(
        (ex, index) => isExerciseUnlocked(index) && !isExerciseCompleted(ex.id)
      );
      const targetExercise = firstIncomplete || orderedExercises[0];
      setSelectedExerciseId(targetExercise.id);
    }
  }, [orderedExercises, selectedExerciseId, userExerciseProgress, progressLoading, isExerciseUnlocked, isExerciseCompleted]);

  // Start time tracking
  useEffect(() => {
    if (selectedExerciseId && !startTime) {
      setStartTime(Date.now());
    }
  }, [selectedExerciseId, startTime]);

  // Exercise completion handler
  const handleCompleteExercise = useCallback(() => {
    if (!selectedExerciseId || !canCompleteExercise(selectedExerciseId)) return;

    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 60000);
    
    updateExerciseProgress({
      exercise_id: selectedExerciseId,
      is_completed: true,
      time_spent: timeSpent,
    });
  }, [selectedExerciseId, canCompleteExercise, startTime, updateExerciseProgress]);

  // Exercise selection handler
  const handleSelectExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setStartTime(Date.now()); // Reset timer for new exercise
  }, []);

  // Loading state
  const isLoading = exercisesLoading || progressLoading;

  return {
    // State
    selectedExerciseId,
    selectedExercise,
    orderedExercises,
    isLoading,
    isCompletingExercise,
    
    // Helper functions
    isExerciseCompleted,
    isVideoCompleted,
    isRecapSubmitted,
    canCompleteExercise,
    isExerciseUnlocked,
    
    // Handlers
    handleCompleteExercise,
    handleSelectExercise,
  };
};
