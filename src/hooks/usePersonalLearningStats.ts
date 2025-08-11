import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserExerciseProgress } from "./useUserExerciseProgress"; // Import from canonical location
import { TrainingExercise } from "@/types/training"; // Import TrainingExercise

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

  return useQuery<PersonalLearningStats>({
    queryKey: ["personal-learning-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get course progress (assuming this is still relevant, though not directly used in stats calculation below)
      const { data: courseProgress } = await supabase
        .from("user_course_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get all exercises to count total
      const { data: allExercises } = await supabase
        .from("edu_knowledge_exercises")
        .select("id, title");

      // Get exercise progress for the user
      const { data: userExerciseProgress } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id);

      // Get video progress for the user
      const { data: videoProgress } = await supabase
        .from("user_video_progress")
        .select(`
          *,
          training_videos(title)
        `)
        .eq("user_id", user.id);

      const totalCourses = courseProgress?.length || 0;
      const completedCourses = courseProgress?.filter(p => p.is_completed).length || 0;
      const totalExercises = allExercises?.length || 0; // Use allExercises for total count
      const completedExercises = userExerciseProgress?.filter(p => p.is_completed).length || 0;
      
      // Calculate total watch time from video progress (assuming 5 minutes per watch_count for simplicity)
      const totalWatchTime = videoProgress?.reduce((acc, v) => acc + (v.watch_count * 5), 0) || 0;
      
      // Average watch percentage based on completed videos vs total videos watched
      const totalVideosWatched = videoProgress?.filter(v => v.watch_count > 0).length || 0;
      const completedVideos = videoProgress?.filter(v => v.is_completed).length || 0;
      const avgWatchPercentage = totalVideosWatched > 0 ? (completedVideos / totalVideosWatched) * 100 : 0;

      const totalSessions = videoProgress?.reduce((acc, v) => acc + v.watch_count, 0) || 0;
      const learningStreak = 5; // Mock data for now
      const dailyAverage = totalWatchTime / 30; // Mock calculation for last 30 days
      const avgCompletionRate = avgWatchPercentage; // Using avgWatchPercentage as completion rate

      // Find most watched exercise
      const exerciseWatchTimes = new Map<string, { title: string, watch_time: number }>();
      videoProgress?.forEach(vp => {
        const exerciseId = vp.video_id; // Assuming video_id maps to exercise_id for simplicity here
        const exerciseTitle = (vp as any).training_videos?.title || 'Unknown Exercise'; // Get title from joined table
        const currentWatchTime = exerciseWatchTimes.get(exerciseId)?.watch_time || 0;
        exerciseWatchTimes.set(exerciseId, {
          title: exerciseTitle,
          watch_time: currentWatchTime + (vp.watch_count * 5) // Add 5 minutes per watch
        });
      });

      let mostWatchedExercise = undefined;
      let maxWatchTime = 0;
      exerciseWatchTimes.forEach((value) => {
        if (value.watch_time > maxWatchTime) {
          maxWatchTime = value.watch_time;
          mostWatchedExercise = value;
        }
      });

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
        mostWatchedExercise
      };

      return stats;
    },
    enabled: !!user,
  });
};