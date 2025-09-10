import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./useUserProfile";
import { TrainingExercise } from "@/types/training";
import { UserExerciseProgress } from "./useUserExerciseProgress";
import { Team } from "./useTeams";
import { secureLog } from "@/lib/utils";

export interface DetailedUserProgress {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: Exclude<UserProfile['role'], 'deleted'>;
  team_name: string | null;
  exercises: ExerciseProgressDetail[];
}

export interface ExerciseProgressDetail {
  exercise_id: string;
  exercise_title: string;
  exercise_order: number;
  video_completed: boolean;
  quiz_passed: boolean;
  practice_completed: boolean;
  practice_test_completed: boolean;
  is_completed: boolean;
  time_spent_minutes: number;
  completion_percentage: number;
  last_updated: string | null;
  video_view_count: number;
  required_viewing_count: number;
}

export interface DetailedLearningProgressData {
  exercises: TrainingExercise[];
  users: DetailedUserProgress[];
  teams: Team[];
}

export const useDetailedLearningProgress = () => {
  return useQuery<DetailedLearningProgressData>({
    queryKey: ["detailed-learning-progress"],
    queryFn: async () => {
      secureLog("Fetching detailed learning progress data...");

      const [
        { data: profiles, error: profilesError },
        { data: exercises, error: exercisesError },
        { data: userProgress, error: userProgressError },
        { data: teams, error: teamsError },
        { data: reviewSubmissions, error: reviewSubmissionsError },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role, team_id").neq("role", "deleted"),
        supabase.from("edu_knowledge_exercises").select("id, title, order_index, min_review_videos, required_viewing_count").order("order_index"),
        supabase.from("user_exercise_progress").select("*, video_view_count"),
        supabase.from("teams").select("*"),
        supabase.from("exercise_review_submissions").select("user_id, exercise_id"),
      ]);

      if (profilesError) throw profilesError;
      if (exercisesError) throw exercisesError;
      if (userProgressError) throw userProgressError;
      if (teamsError) throw teamsError;
      if (reviewSubmissionsError) throw reviewSubmissionsError;

      const exercisesMap = new Map<string, TrainingExercise>(
        (exercises || []).map((ex) => [ex.id, ex as TrainingExercise])
      );
      
      const teamsMap = new Map<string, Team>(
        (teams || []).map((team) => [team.id, team as Team])
      );

      // Create review submissions map
      const reviewSubmissionsMap = new Map<string, number>();
      (reviewSubmissions || []).forEach(submission => {
        const key = `${submission.user_id}-${submission.exercise_id}`;
        reviewSubmissionsMap.set(key, (reviewSubmissionsMap.get(key) || 0) + 1);
      });

      const usersProgress: DetailedUserProgress[] = (profiles || []).map((profile) => {
        const userProgressList: ExerciseProgressDetail[] = [];

        // Get all exercises in order
        const orderedExercises = Array.from(exercisesMap.values())
          .sort((a, b) => a.order_index - b.order_index);

        orderedExercises.forEach((exercise) => {
          const progress = (userProgress || []).find(
            (p) => p.user_id === profile.id && p.exercise_id === exercise.id
          ) as UserExerciseProgress | undefined;

          const reviewSubmissionKey = `${profile.id}-${exercise.id}`;
          const submissionCount = reviewSubmissionsMap.get(reviewSubmissionKey) || 0;
          const practiceCompleted = submissionCount >= (exercise.min_review_videos || 0);

          // Calculate completion percentage for this exercise
          const completedParts = [
            progress?.video_completed,
            progress?.quiz_passed,
            practiceCompleted,
            false, // practice_test_completed (placeholder)
          ].filter(Boolean).length;
          
          const completionPercentage = (completedParts / 4) * 100;

          userProgressList.push({
            exercise_id: exercise.id,
            exercise_title: exercise.title,
            exercise_order: exercise.order_index,
            video_completed: progress?.video_completed || false,
            quiz_passed: progress?.quiz_passed || false,
            practice_completed: practiceCompleted,
            practice_test_completed: false, // Placeholder
            is_completed: progress?.is_completed || false,
            time_spent_minutes: progress?.time_spent || 0,
            completion_percentage: Math.round(completionPercentage),
            last_updated: progress?.updated_at || null,
            video_view_count: progress?.video_view_count || 0,
            required_viewing_count: exercise.required_viewing_count || 1,
          });
        });

        return {
          user_id: profile.id,
          user_name: profile.full_name || profile.email,
          user_email: profile.email,
          user_role: profile.role as Exclude<UserProfile['role'], 'deleted'>,
          team_name: profile.team_id ? teamsMap.get(profile.team_id)?.name || null : null,
          exercises: userProgressList,
        };
      });

      return {
        exercises: Array.from(exercisesMap.values()).sort((a, b) => a.order_index - b.order_index),
        users: usersProgress,
        teams: teams || [],
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};