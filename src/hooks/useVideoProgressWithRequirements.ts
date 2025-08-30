import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from "@/hooks/useAuth";

type UserExerciseProgress = {
  exercise_id: string;
  user_id: string;
  time_spent?: number;
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
};

export const useVideoProgressWithRequirements = (exerciseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: progress, isLoading: isLoadingProgress } = useQuery<UserExerciseProgress | null>({
    queryKey: ['videoProgress', exerciseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_exercise_progress')
        .select('exercise_id, user_id, time_spent, video_duration, watch_percentage, session_count, video_completed')
        .eq('exercise_id', exerciseId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching video progress:', error);
      }
      return data;
    },
    enabled: !!exerciseId && !!user,
  });

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

  if (exercise) {
    const timeSpentMinutes = (progress?.time_spent || 0) / 60;
    const estimatedDurationMinutes = exercise.min_completion_time || 1;
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