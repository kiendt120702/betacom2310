import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Assuming these types based on usage in components and DB schema
// This might need adjustment if your DB schema for user_exercise_progress is different
type UserExerciseProgress = {
  exercise_id: string;
  user_id: string;
  total_watch_time?: number;
  video_duration?: number;
  watch_percentage?: number;
  session_count?: number;
  video_completed?: boolean;
  updated_at?: string;
};

type Exercise = {
  id: string;
  min_completion_time: number;
  min_study_sessions: number;
  // ... other exercise properties
};

// The hook
export const useVideoProgressTracking = (exerciseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch exercise details
  const { data: exercise, isLoading: isLoadingExercise } = useQuery<Exercise | null>({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edu_knowledge_exercises')
        .select('id, min_completion_time, min_study_sessions')
        .eq('id', exerciseId)
        .single();
      if (error) {
        console.error('Error fetching exercise:', error);
        return null;
      }
      return data;
    },
    enabled: !!exerciseId,
  });

  // 2. Fetch user's video progress for this exercise
  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserExerciseProgress | null>({
    queryKey: ['videoProgress', exerciseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_exercise_progress')
        .select('total_watch_time, video_duration, watch_percentage, session_count, video_completed')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "row not found"
        console.error('Error fetching video progress:', error);
      }
      return data;
    },
    enabled: !!exerciseId && !!user,
  });

  // 3. Combine and compute derived state
  const data = (() => {
    if (!exercise) {
      return null;
    }

    const estimatedDurationMinutes = exercise.min_completion_time || 5;
    const estimatedDurationSeconds = estimatedDurationMinutes * 60;
    const sessionCount = progress?.session_count || 1;
    const requiredViewingCount = exercise.min_study_sessions || 1;

    const isRequirementMet = (progress?.video_completed || false) && sessionCount >= requiredViewingCount;

    return {
      ...progress,
      session_count: sessionCount,
      required_viewing_count: requiredViewingCount,
      total_required_watch_time: estimatedDurationSeconds * requiredViewingCount,
      is_requirement_met: isRequirementMet,
    };
  })();

  // 4. Mutation to update progress
  const { mutate: updateVideoProgress, isPending: isUpdating } = useMutation({
    mutationFn: async (updateData: Partial<UserExerciseProgress>) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_exercise_progress')
        .upsert({
          ...updateData,
          user_id: user.id,
          exercise_id: exerciseId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, exercise_id' });
      
      if (error) {
        toast.error('Failed to save video progress.');
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoProgress', exerciseId, user?.id] });
    },
  });

  // This logic seems to be used for calculations, let's ensure it's correct
  // This is just for context, the main fix is above.
  if (exercise) {
    const timeSpentMinutes = (progress?.total_watch_time || 0) / 60;
    const estimatedDurationMinutes = exercise.min_completion_time || 1; // Avoid division by zero
    // This calculation seems to be for deriving session count based on total time spent
    const sessionCount = Math.max(1, Math.floor(timeSpentMinutes / estimatedDurationMinutes) + 1);
    const requiredCount = exercise.min_study_sessions || 1;
  }


  return {
    data,
    updateVideoProgress,
    isLoading: isLoadingExercise || isLoadingProgress,
    isUpdating,
  };
};