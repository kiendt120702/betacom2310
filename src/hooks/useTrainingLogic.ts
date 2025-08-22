import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useEduExercises } from "@/hooks/useEduExercises";
import { useUserExerciseProgress } from "@/hooks/useUserExerciseProgress";
import { useVideoReviewSubmissions } from "@/hooks/useVideoReviewSubmissions";
import { TrainingExercise } from "@/types/training";

export type SelectedPart = 'video' | 'theory' | 'quiz' | 'practice' | 'practice_test';

export const useTrainingLogic = () => {
  const [searchParams] = useSearchParams();
  const exerciseParam = searchParams.get("exercise");
  const partParam = searchParams.get("part") as SelectedPart | null;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseParam);
  const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(partParam || 'video');
  const [startTime, setStartTime] = useState<number>();

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

  const isTheoryRead = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    const progress = allUserExerciseProgress.find(p => p.exercise_id === exerciseId);
    return !!progress?.theory_read;
  }, [allUserExerciseProgress]);

  const isLearningPartCompleted = useCallback((exerciseId: string): boolean => {
    if (!Array.isArray(allUserExerciseProgress)) return false;
    const progress = allUserExerciseProgress.find(p => p.exercise_id === exerciseId);
    const exercise = orderedExercises.find(e => e.id === exerciseId);
    
    const videoStatus = !!progress?.video_completed;
    const theoryStatus = exercise?.content ? !!progress?.theory_read : true; // If no content, theory is considered read
    
    return videoStatus && theoryStatus;
  }, [allUserExerciseProgress, orderedExercises]);

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
    if (exerciseIndex === 0) return true;
    const previousExercise = orderedExercises[exerciseIndex - 1];
    return previousExercise ? isExerciseCompleted(previousExercise.id) : false;
  }, [orderedExercises, isExerciseCompleted]);

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
    isTheoryRead, // Export new function
    isTheoryTestCompleted,
    isPracticeCompleted,
    isPracticeTestCompleted,
    canCompleteExercise,
    isExerciseUnlocked,
    handleCompleteExercise,
    handleSelect,
  };
};