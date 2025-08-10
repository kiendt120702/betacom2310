import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatWatchTime } from "@/hooks/useVideoTracking";

export interface PersonalLearningStats {
  total_watch_time: number;
  total_videos_watched: number;
  completed_exercises: number;
  total_exercises: number;
  avg_completion_rate: number;
  total_sessions: number;
  learning_streak: number;
  most_watched_exercise: {
    title: string;
    watch_time: number;
  } | null;
  weekly_progress: {
    week: string;
    watch_time: number;
  }[];
  daily_average: number;
}

export const usePersonalLearningStats = () => {
  return useQuery({
    queryKey: ["personal-learning-stats"],
    queryFn: async (): Promise<PersonalLearningStats> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get video tracking data
      const { data: videoTracking } = await supabase
        .from("video_tracking")
        .select(`
          total_watch_time,
          video_duration,
          watch_percentage,
          session_count,
          updated_at,
          edu_knowledge_exercises(title)
        `)
        .eq("user_id", user.user.id);

      // Get exercise progress data
      const { data: exerciseProgress } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.user.id);

      // Get total exercises count
      const { count: totalExercises } = await supabase
        .from("edu_knowledge_exercises")
        .select("*", { count: "exact" });

      if (!videoTracking || !exerciseProgress) {
        return {
          total_watch_time: 0,
          total_videos_watched: 0,
          completed_exercises: 0,
          total_exercises: totalExercises || 0,
          avg_completion_rate: 0,
          total_sessions: 0,
          learning_streak: 0,
          most_watched_exercise: null,
          weekly_progress: [],
          daily_average: 0,
        };
      }

      // Calculate basic stats
      const totalWatchTime = videoTracking.reduce((sum, record) => sum + record.total_watch_time, 0);
      const totalVideosWatched = videoTracking.length;
      const completedExercises = exerciseProgress.filter(ex => ex.is_completed).length;
      const avgCompletionRate = videoTracking.length > 0 
        ? videoTracking.reduce((sum, record) => sum + record.watch_percentage, 0) / videoTracking.length 
        : 0;
      const totalSessions = videoTracking.reduce((sum, record) => sum + record.session_count, 0);

      // Find most watched exercise
      const mostWatched = videoTracking.reduce((max, current) => 
        current.total_watch_time > (max?.total_watch_time || 0) ? current : max, 
        null as any
      );

      const mostWatchedExercise = mostWatched ? {
        title: mostWatched.edu_knowledge_exercises?.title || "Unknown",
        watch_time: mostWatched.total_watch_time,
      } : null;

      // Calculate weekly progress (last 4 weeks)
      const weeklyProgress = calculateWeeklyProgress(videoTracking);

      // Calculate daily average
      const daysWithActivity = calculateActiveDays(videoTracking);
      const dailyAverage = daysWithActivity > 0 ? totalWatchTime / daysWithActivity : 0;

      // Calculate learning streak
      const learningStreak = calculateLearningStreak(videoTracking);

      return {
        total_watch_time: totalWatchTime,
        total_videos_watched: totalVideosWatched,
        completed_exercises: completedExercises,
        total_exercises: totalExercises || 0,
        avg_completion_rate: avgCompletionRate,
        total_sessions: totalSessions,
        learning_streak: learningStreak,
        most_watched_exercise: mostWatchedExercise,
        weekly_progress: weeklyProgress,
        daily_average: dailyAverage,
      };
    },
  });
};

// Helper function to calculate weekly progress
function calculateWeeklyProgress(videoTracking: any[]): { week: string; watch_time: number }[] {
  const now = new Date();
  const weeks: { week: string; watch_time: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekWatchTime = videoTracking
      .filter(record => {
        const recordDate = new Date(record.updated_at);
        return recordDate >= weekStart && recordDate <= weekEnd;
      })
      .reduce((sum, record) => sum + record.total_watch_time, 0);

    weeks.push({
      week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      watch_time: weekWatchTime,
    });
  }

  return weeks;
}

// Helper function to calculate active days
function calculateActiveDays(videoTracking: any[]): number {
  const activeDates = new Set(
    videoTracking
      .filter(record => record.total_watch_time > 0)
      .map(record => new Date(record.updated_at).toDateString())
  );
  return activeDates.size;
}

// Helper function to calculate learning streak
function calculateLearningStreak(videoTracking: any[]): number {
  if (videoTracking.length === 0) return 0;

  const activeDates = videoTracking
    .filter(record => record.total_watch_time > 0)
    .map(record => new Date(record.updated_at).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const uniqueDates = Array.from(new Set(activeDates));
  
  let streak = 0;
  const today = new Date().toDateString();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (currentDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper functions for formatting
export const formatLearningTime = (minutes: number): string => {
  return formatWatchTime(minutes);
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Chưa có streak";
  if (streak === 1) return "Streak 1 ngày! 🔥";
  if (streak < 7) return `Streak ${streak} ngày! 🔥`;
  if (streak < 30) return `Streak ${streak} ngày! 🔥🔥`;
  return `Streak ${streak} ngày! 🔥🔥🔥`;
};

export const getLearningLevel = (totalMinutes: number): { level: string; progress: number; nextLevel: number } => {
  const levels = [
    { name: "Người mới", minutes: 0 },
    { name: "Học sinh", minutes: 60 * 5 }, // 5 hours
    { name: "Sinh viên", minutes: 60 * 20 }, // 20 hours
    { name: "Chuyên gia", minutes: 60 * 50 }, // 50 hours
    { name: "Bậc thầy", minutes: 60 * 100 }, // 100 hours
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length - 1; i++) {
    if (totalMinutes >= levels[i].minutes && totalMinutes < levels[i + 1].minutes) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1];
      break;
    }
  }

  if (totalMinutes >= levels[levels.length - 1].minutes) {
    currentLevel = levels[levels.length - 1];
    nextLevel = levels[levels.length - 1]; // Max level
  }

  const progress = nextLevel.minutes > currentLevel.minutes 
    ? ((totalMinutes - currentLevel.minutes) / (nextLevel.minutes - currentLevel.minutes)) * 100
    : 100;

  return {
    level: currentLevel.name,
    progress: Math.min(progress, 100),
    nextLevel: nextLevel.minutes,
  };
};