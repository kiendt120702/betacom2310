
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
  learningStreak: number;
  dailyAverage: number;
  avgCompletionRate: number;
  totalVideosWatched: number;
  mostWatchedExercise?: {
    title: string;
    watch_time: number;
  };
}

export const formatLearningTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Hãy bắt đầu streak!";
  if (streak < 3) return "Khởi đầu tốt!";
  if (streak < 7) return "Đang tiến bộ!";
  if (streak < 14) return "Tuyệt vời!";
  if (streak < 30) return "Xuất sắc!";
  return "Huyền thoại!";
};

export const getLearningLevel = (totalMinutes: number) => {
  const levels = [
    { level: 1, name: "Người mới", minMinutes: 0, maxMinutes: 60 },
    { level: 2, name: "Học viên", minMinutes: 60, maxMinutes: 300 },
    { level: 3, name: "Tích cực", minMinutes: 300, maxMinutes: 900 },
    { level: 4, name: "Chuyên cần", minMinutes: 900, maxMinutes: 1800 },
    { level: 5, name: "Thành thạo", minMinutes: 1800, maxMinutes: 3600 },
    { level: 6, name: "Chuyên gia", minMinutes: 3600, maxMinutes: Infinity },
  ];

  const currentLevel = levels.find(l => totalMinutes >= l.minMinutes && totalMinutes < l.maxMinutes) || levels[levels.length - 1];
  const progress = currentLevel.maxMinutes === Infinity 
    ? 100 
    : Math.min(100, ((totalMinutes - currentLevel.minMinutes) / (currentLevel.maxMinutes - currentLevel.minMinutes)) * 100);

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    progress: Math.round(progress)
  };
};

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
      const totalWatchTime = videoProgress?.reduce((acc, v) => acc + (v.watch_count * 5), 0) || 0;
      const avgWatchPercentage = videoProgress?.length > 0 
        ? (videoProgress.filter(v => v.is_completed).length / videoProgress.length) * 100 
        : 0;
      const totalSessions = videoProgress?.reduce((acc, v) => acc + v.watch_count, 0) || 0;
      const learningStreak = 5; // Mock data for now
      const dailyAverage = totalWatchTime / 30; // Mock calculation
      const avgCompletionRate = avgWatchPercentage;
      const totalVideosWatched = videoProgress?.filter(v => v.watch_count > 0).length || 0;

      const stats: PersonalLearningStats = {
        totalCourses,
        completedCourses,
        totalExercises,
        completedExercises,
        totalWatchTime,
        avgWatchPercentage,
        totalSessions,
        learningStreak,
        dailyAverage,
        avgCompletionRate,
        totalVideosWatched,
        mostWatchedExercise: totalWatchTime > 0 ? {
          title: "Bài học mẫu",
          watch_time: Math.floor(totalWatchTime * 0.3)
        } : undefined
      };

      return stats;
    },
    enabled: !!user,
  });
};
