import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises } from "@/hooks/useEduExercises"; // Keep this import
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress"; // Import from its new canonical location
import { TrainingExercise } from "@/types/training"; // Import TrainingExercise

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
  // Now use useUserExerciseProgress without an exerciseId to get all progress
  const { 
    data: allUserExerciseProgress, 
    isLoading: progressLoading, 
    updateProgress, 
    isUpdating 
  } = useUserExerciseProgress();

  // Memoized computations for better performance
  const orderedExercises = useMemo(() => 
    exercises?.sort((a, b) => a.order_index - b.order_index) || [], 
    [exercises]
  );

  const selectedExercise = useMemo(() => 
    orderedExercises.find((e) => e.id === selectedExerciseId), 
    [orderedExercises, selectedExerciseId]
  );

  // Helper functions
  const isExerciseCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false; // Ensure it's an array
    return allUserExerciseProgress.some(
      (progress) => progress.exercise_id === exerciseId && progress.is_completed
    ) || false;
  }, [allUserExerciseProgress]);

  const isVideoCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false; // Ensure it's an array
    const progress = allUserExerciseProgress.find(
      (progress) => progress.exercise_id === exerciseId
    );
    return progress?.video_completed || false;
  }, [allUserExerciseProgress]);

  const isRecapSubmitted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false; // Ensure it's an array
    const progress = allUserExerciseProgress.find(
      (progress) => progress.exercise_id === exerciseId
    );
    return progress?.recap_submitted || false;
  }, [allUserExerciseProgress]);

  const canCompleteExercise = useCallback((exerciseId: string): boolean => {
    // User can complete exercise if they have submitted a recap
    // Video watching is not required to complete exercise
    return isRecapSubmitted(exerciseId);
  }, [isRecapSubmitted]);

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
  }, [orderedExercises, selectedExerciseId, allUserExerciseProgress, progressLoading, isExerciseUnlocked, isExerciseCompleted]);

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
    
    updateProgress({
      exercise_id: selectedExerciseId,
      is_completed: true,
      time_spent: timeSpent,
    });
  }, [selectedExerciseId, canCompleteExercise, startTime, updateProgress]);

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
    isCompletingExercise: isUpdating, // Use isUpdating from useUserExerciseProgress
    
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