import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./useUserProfile";
import { TrainingExercise } from "@/types/training";
import { UserExerciseProgress } from "./useUserExerciseProgress";
import { Team } from "./useTeams";
import { secureLog } from "@/lib/utils";

export interface UserLearningSummary {
  id: string;
  full_name: string;
  email: string;
  role: Exclude<UserProfile['role'], 'deleted'>; // Exclude 'deleted' role
  team_name: string | null;
  total_exercises: number;
  completed_exercises: number;
  completion_percentage: number;
  total_time_spent_minutes: number;
  video_reviews_submitted: number;
  required_video_reviews: number;
}

export interface LearningAnalyticsData {
  overall: {
    total_users: number;
    total_exercises_completed_across_all_users: number;
    total_unique_exercises: number;
    total_learning_time_minutes: number;
  };
  users: UserLearningSummary[];
  teams: Team[]; // For filtering
}

export const formatLearningTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const useLearningAnalytics = () => {
  return useQuery<LearningAnalyticsData>({
    queryKey: ["learning-analytics"],
    queryFn: async () => {
      secureLog("Fetching data for learning analytics dashboard...");

      const [
        { data: profiles, error: profilesError },
        { data: exercises, error: exercisesError },
        { data: userProgress, error: userProgressError },
        { data: teams, error: teamsError },
        { data: reviewSubmissions, error: reviewSubmissionsError },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role, team_id"),
        supabase.from("edu_knowledge_exercises").select("id, min_review_videos"),
        supabase.from("user_exercise_progress").select("user_id, exercise_id, is_completed, time_spent, recap_submitted"),
        supabase.from("teams").select("id, name, created_at"), // Include created_at to match Team interface
        supabase.from("exercise_review_submissions").select("user_id, exercise_id"),
      ]);

      if (profilesError) throw profilesError;
      if (exercisesError) throw exercisesError;
      if (userProgressError) throw userProgressError;
      if (teamsError) throw teamsError;
      if (reviewSubmissionsError) throw reviewSubmissionsError;

      const allExercisesMap = new Map<string, TrainingExercise>(
        (exercises || []).map((ex) => [ex.id, ex as TrainingExercise])
      );
      const teamsMap = new Map<string, Team>((teams || []).map((team) => [team.id, team as Team])); // Cast to Team

      let totalExercisesCompletedAcrossAllUsers = 0;
      let totalLearningTimeMinutes = 0;
      const uniqueUsersWithProgress = new Set<string>();
      const totalUniqueExercises = allExercisesMap.size;

      const usersSummary: UserLearningSummary[] = (profiles || [])
        .filter(p => p.role !== 'deleted') // Exclude deleted users
        .map((profile) => {
          const userTotalExercises = allExercisesMap.size;
          let userCompletedExercises = 0;
          let userTotalTimeSpent = 0;
          let userVideoReviewsSubmitted = 0;
          let userRequiredVideoReviews = 0;

          const userProgressMap = new Map<string, UserExerciseProgress>(
            (userProgress || [])
              .filter((p) => p.user_id === profile.id)
              .map((p) => [p.exercise_id, p as UserExerciseProgress])
          );

          const userReviewSubmissionsMap = new Map<string, number>();
          (reviewSubmissions || [])
            .filter(s => s.user_id === profile.id)
            .forEach(s => {
              userReviewSubmissionsMap.set(s.exercise_id, (userReviewSubmissionsMap.get(s.exercise_id) || 0) + 1);
            });

          allExercisesMap.forEach((exercise, exerciseId) => {
            const progress = userProgressMap.get(exerciseId);
            if (progress?.is_completed) {
              userCompletedExercises++;
            }
            userTotalTimeSpent += progress?.time_spent || 0;
            userRequiredVideoReviews += exercise.min_review_videos || 0;
            userVideoReviewsSubmitted += userReviewSubmissionsMap.get(exerciseId) || 0;
          });

          const completionPercentage =
            userTotalExercises > 0
              ? (userCompletedExercises / userTotalExercises) * 100
              : 0;

          totalExercisesCompletedAcrossAllUsers += userCompletedExercises;
          totalLearningTimeMinutes += userTotalTimeSpent;
          uniqueUsersWithProgress.add(profile.id);

          return {
            id: profile.id,
            full_name: profile.full_name || profile.email,
            email: profile.email,
            role: profile.role as Exclude<UserProfile['role'], 'deleted'>, // Cast role after filtering
            team_name: profile.team_id ? teamsMap.get(profile.team_id)?.name || null : null,
            total_exercises: userTotalExercises,
            completed_exercises: userCompletedExercises,
            completion_percentage: parseFloat(completionPercentage.toFixed(1)),
            total_time_spent_minutes: userTotalTimeSpent,
            video_reviews_submitted: userVideoReviewsSubmitted,
            required_video_reviews: userRequiredVideoReviews,
          };
        });

      return {
        overall: {
          total_users: uniqueUsersWithProgress.size,
          total_exercises_completed_across_all_users: totalExercisesCompletedAcrossAllUsers,
          total_unique_exercises: totalUniqueExercises,
          total_learning_time_minutes: totalLearningTimeMinutes,
        },
        users: usersSummary,
        teams: teams || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};