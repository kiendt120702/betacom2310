import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { PersonalExerciseDetail } from "@/components/learning-progress/PersonalExerciseDetails";
import { TrainingExercise } from "@/types/training";
import { UserExerciseProgress } from "./useUserExerciseProgress";

export const usePersonalExerciseDetails = () => {
  const { user } = useAuth();

  return useQuery<PersonalExerciseDetail[]>({
    queryKey: ["personal-exercise-details", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from("edu_knowledge_exercises")
        .select("id, title, order_index, min_review_videos")
        .order("order_index");

      if (exercisesError) throw exercisesError;

      // Get user's exercise progress
      const { data: userProgress, error: progressError } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Get quiz scores by joining through edu_quizzes
      const { data: quizResults, error: quizError } = await supabase
        .from("edu_quiz_submissions")
        .select("score, edu_quizzes!inner(exercise_id)")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (quizError) throw quizError;

      // Get review video submissions
      const { data: reviewSubmissions, error: reviewError } = await supabase
        .from("exercise_review_submissions")
        .select("exercise_id")
        .eq("user_id", user.id);

      if (reviewError) throw reviewError;

      // Create maps for quick lookup
      const progressMap = new Map(
        (userProgress || []).map(p => [p.exercise_id, p])
      );

      const quizScoreMap = new Map<string, number>();
      (quizResults || []).forEach(result => {
        const exerciseId = result.edu_quizzes?.exercise_id;
        if (exerciseId && !quizScoreMap.has(exerciseId)) {
          quizScoreMap.set(exerciseId, result.score);
        }
      });

      const reviewCountMap = new Map<string, number>();
      (reviewSubmissions || []).forEach(submission => {
        reviewCountMap.set(
          submission.exercise_id, 
          (reviewCountMap.get(submission.exercise_id) || 0) + 1
        );
      });

      // Build detailed exercise list
      const detailedExercises: PersonalExerciseDetail[] = (exercises || []).map(exercise => {
        const progress = progressMap.get(exercise.id);
        const quizScore = quizScoreMap.get(exercise.id);
        const reviewCount = reviewCountMap.get(exercise.id) || 0;

        // Calculate completion tasks
        const requiredReviews = exercise.min_review_videos || 0;
        const practiceCompleted = reviewCount >= requiredReviews;

        const completedTasks = [
          progress?.video_completed,
          progress?.quiz_passed,
          practiceCompleted,
          false, // practice_test_completed - placeholder
        ].filter(Boolean).length;

        const completionPercentage = (completedTasks / 4) * 100;

        return {
          exercise_id: exercise.id,
          exercise_title: exercise.title,
          exercise_order: exercise.order_index,
          video_completed: progress?.video_completed || false,
          quiz_passed: progress?.quiz_passed || false,
          practice_completed: practiceCompleted,
          practice_test_completed: false, // Placeholder
          is_completed: progress?.is_completed || false,
          time_spent_seconds: progress?.time_spent || 0,
          completion_percentage: Math.round(completionPercentage),
          last_updated: progress?.updated_at || null,
          quiz_score: quizScore,
          review_videos_count: reviewCount,
          required_reviews: requiredReviews,
        };
      });

      return detailedExercises;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};