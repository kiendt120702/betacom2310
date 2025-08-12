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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hooks
  const { data: existingRecap, isLoading: recapLoading } = useGetExerciseRecap(exerciseId);
  const { updateProgress } = useUserExerciseProgress(exerciseId);
  const submitRecap = useSubmitRecap();

  // Computed values
  const hasSubmitted = useMemo(
    () => Boolean(existingRecap?.submitted_at),
    [existingRecap?.submitted_at]
  );

  const canSubmit = useMemo(
    () => content.trim().length > 0 && !submitRecap.isPending,
    [content, submitRecap.isPending]
  );

  const isLoading = recapLoading;

  // Load existing recap content - simplified
  useEffect(() => {
    if (existingRecap?.recap_content) {
      setContent(existingRecap.recap_content);
      setHasUnsavedChanges(false);
    }
  }, [existingRecap?.recap_content]);

  // Handle content changes - simplified 
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true); // Always mark as changed when typing
  }, [content]);

  // Handle recap submission
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    try {
      // Submit recap
      await submitRecap.mutateAsync({
        exercise_id: exerciseId,
        recap_content: content.trim(),
      });

      // Update progress
      await updateProgress({
        exercise_id: exerciseId,
        recap_submitted: true,
      });

      // Reset unsaved changes
      setHasUnsavedChanges(false);

      // Notify parent component
      onRecapSubmitted?.();
    } catch (error) {
      console.error('Error submitting recap:', error);
      // Error handling is done in the mutation hook
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
    setContent,
    hasUnsavedChanges,
    
    // Submission state
    isSubmitting: submitRecap.isPending,
    hasSubmitted,
    canSubmit,
    
    // Actions
    handleSubmit,
    handleContentChange,
    
    // Loading state
    isLoading,
  };
};