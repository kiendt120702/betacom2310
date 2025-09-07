import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetExerciseRecap, useSubmitRecap } from '@/hooks/useExerciseRecaps';
import { useUserExerciseProgress } from '@/hooks/useUserExerciseProgress';

interface UseRecapManagerProps {
  exerciseId: string;
  onRecapSubmitted?: () => void;
}

interface UseRecapManagerReturn {
  // Content state
  content: string;
  setContent: (content: string) => void;
  hasUnsavedChanges: boolean;
  
  // Submission state
  isSubmitting: boolean;
  hasSubmitted: boolean;
  canSubmit: boolean;
  
  // Actions
  handleSubmit: () => Promise<void>;
  handleContentChange: (newContent: string) => void;
  
  // Loading state
  isLoading: boolean;
}

export const useRecapManager = ({
  exerciseId,
  onRecapSubmitted,
}: UseRecapManagerProps): UseRecapManagerReturn => {
  const [content, setContent] = useState('');
  
  const { data: existingRecap, isLoading: recapLoading } = useGetExerciseRecap(exerciseId);
  const { updateProgress } = useUserExerciseProgress(exerciseId);
  const submitRecap = useSubmitRecap();

  // Set initial content from fetched data
  useEffect(() => {
    if (existingRecap) {
      setContent(existingRecap.recap_content || '');
    } else {
      // Reset content when there's no recap (e.g., switching exercises)
      setContent('');
    }
  }, [existingRecap]);

  const hasSubmitted = useMemo(
    () => !!existingRecap?.submitted_at,
    [existingRecap]
  );

  const hasUnsavedChanges = useMemo(
    () => content !== (existingRecap?.recap_content || ''),
    [content, existingRecap]
  );

  const canSubmit = useMemo(
    () => content.trim().length > 0 && !submitRecap.isPending,
    [content, submitRecap.isPending]
  );

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    try {
      await submitRecap.mutateAsync({
        exercise_id: exerciseId,
        recap_content: content.trim(),
      });

      await updateProgress({
        exercise_id: exerciseId,
        recap_submitted: true,
      });

      onRecapSubmitted?.();
    } catch (error) {
      console.error('Error submitting recap:', error);
    }
  }, [
    canSubmit,
    submitRecap,
    exerciseId,
    content,
    updateProgress,
    onRecapSubmitted,
  ]);

  return {
    // Content state
    content,
    setContent, // Not really needed by component, but good practice
    hasUnsavedChanges,
    isSubmitting: submitRecap.isPending,
    hasSubmitted,
    canSubmit,
    handleSubmit,
    handleContentChange,
    isLoading: recapLoading,
  };
};