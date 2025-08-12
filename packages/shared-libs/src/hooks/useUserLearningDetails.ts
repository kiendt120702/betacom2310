import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { TrainingExercise } from "../types/training";

export interface UserExerciseDetails extends TrainingExercise {
  progress: {
    is_completed: boolean;
    video_completed: boolean;
    recap_submitted: boolean;
    time_spent: number;
    submitted_review_videos: number;
  } | null;
}

export const useUserLearningDetails = (userId: string | null) => {
  return useQuery<UserExerciseDetails[]>({
    queryKey: ["user-learning-details", userId],
    queryFn: async () => {
      if (!userId) return [];

      const [
        { data: exercises, error: exercisesError },
        { data: userProgress, error: userProgressError },
        { data: reviewSubmissions, error: reviewSubmissionsError },
      ] = await Promise.all([
        supabase.from("edu_knowledge_exercises").select("*").order("order_index", { ascending: true }),
        supabase.from("user_exercise_progress").select("*").eq("user_id", userId),
        supabase.from("exercise_review_submissions").select("exercise_id").eq("user_id", userId),
      ]);

      if (exercisesError) throw exercisesError;
      if (userProgressError) throw userProgressError;
      if (reviewSubmissionsError) throw reviewSubmissionsError;

      const progressMap = new Map(userProgress?.map((p: any) => [p.exercise_id, p]));
      const submissionCountMap = new Map<string, number>();
      reviewSubmissions?.forEach((s: any) => {
        submissionCountMap.set(s.exercise_id, (submissionCountMap.get(s.exercise_id) || 0) + 1);
      });

      const detailedProgress = (exercises || []).map((exercise: any): UserExerciseDetails => {
        const progress = progressMap.get(exercise.id);
        return {
          ...(exercise as TrainingExercise), // Assuming the structure matches
          exercise_type: exercise.exercise_video_url ? 'video' : 'reading',
          requires_submission: exercise.required_review_videos > 0,
          estimated_duration: exercise.min_completion_time || 5,
          progress: progress ? {
            is_completed: progress.is_completed,
            video_completed: progress.video_completed,
            recap_submitted: progress.recap_submitted,
            time_spent: progress.time_spent || 0,
            submitted_review_videos: submissionCountMap.get(exercise.id) || 0,
          } : null,
        };
      });

      return detailedProgress;
    },
    enabled: !!userId,
  });
};