
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PersonalLearningStats {
  totalCourses: number;
  completedCourses: number;
  totalExercises: number;
  completedExercises: number;
  totalWatchTime: number;
  avgWatchPercentage: number;
  totalSessions: number;
}

export const usePersonalLearningStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["personal-learning-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get course progress
      const { data: courseProgress } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get exercise progress
      const { data: exerciseProgress } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get video progress
      const { data: videoProgress } = await supabase
        .from("user_video_progress")
        .select("*")
        .eq("user_id", user.id);

      const totalCourses = courseProgress?.length || 0;
      const completedCourses = courseProgress?.filter(p => p.is_completed).length || 0;
      const totalExercises = exerciseProgress?.length || 0;
      const completedExercises = exerciseProgress?.filter(p => p.is_completed).length || 0;
      const totalWatchTime = videoProgress?.reduce((acc, v) => acc + (v.watch_count * 5), 0) || 0; // Estimate 5 min per watch
      const avgWatchPercentage = videoProgress?.length > 0 
        ? (videoProgress.filter(v => v.is_completed).length / videoProgress.length) * 100 
        : 0;
      const totalSessions = videoProgress?.reduce((acc, v) => acc + v.watch_count, 0) || 0;

      const stats: PersonalLearningStats = {
        totalCourses,
        completedCourses,
        totalExercises,
        completedExercises,
        totalWatchTime,
        avgWatchPercentage,
        totalSessions
      };

      return stats;
    },
    enabled: !!user,
  });
};
