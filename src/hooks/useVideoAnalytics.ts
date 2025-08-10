import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoAnalyticsOverview {
  total_users: number;
  total_videos: number;
  avg_watch_time: number;
  completion_rate: number;
  total_sessions: number;
}

export interface ExerciseVideoStats {
  exercise_id: string;
  exercise_title: string;
  total_viewers: number;
  avg_watch_time: number;
  avg_completion_rate: number;
  total_sessions: number;
  dropout_points: number[];
  avg_rewatch_count: number;
}

export interface UserVideoStats {
  user_id: string;
  user_email: string;
  total_watch_time: number;
  videos_watched: number;
  avg_completion_rate: number;
  total_sessions: number;
  most_watched_exercise: string;
}

// Get overview analytics
export const useVideoAnalyticsOverview = () => {
  return useQuery({
    queryKey: ["video-analytics-overview"],
    queryFn: async () => {
      // Get total unique users who have watched videos
      const { data: totalUsersData } = await supabase
        .from("video_tracking")
        .select("user_id", { count: "exact" })
        .not("total_watch_time", "eq", 0);

      // Get total videos with tracking data
      const { data: totalVideosData } = await supabase
        .from("video_tracking")
        .select("exercise_id", { count: "exact" });

      // Get average watch time across all users
      const { data: avgWatchTimeData } = await supabase
        .rpc("get_avg_watch_time");

      // Get completion rate (users who watched >80% of any video)
      const { data: completionData } = await supabase
        .from("video_tracking")
        .select("*")
        .gte("watch_percentage", 80);

      // Get total sessions
      const { data: sessionsData } = await supabase
        .rpc("get_total_sessions");

      const totalUsers = totalUsersData?.length || 0;
      const totalVideos = totalVideosData?.length || 0;
      const avgWatchTime = avgWatchTimeData || 0;
      const completedWatches = completionData?.length || 0;
      const totalSessions = sessionsData || 0;

      return {
        total_users: totalUsers,
        total_videos: totalVideos,
        avg_watch_time: avgWatchTime,
        completion_rate: totalUsers > 0 ? (completedWatches / totalUsers) * 100 : 0,
        total_sessions: totalSessions,
      } as VideoAnalyticsOverview;
    },
  });
};

// Get per-exercise video statistics
export const useExerciseVideoStats = () => {
  return useQuery({
    queryKey: ["exercise-video-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tracking")
        .select(`
          exercise_id,
          total_watch_time,
          video_duration,
          watch_percentage,
          session_count,
          edu_knowledge_exercises(title)
        `);

      if (error) throw error;

      // Group by exercise and calculate stats
      const exerciseStats: { [key: string]: any } = {};

      data?.forEach((record: any) => {
        const exerciseId = record.exercise_id;
        const exerciseTitle = record.edu_knowledge_exercises?.title || "Unknown";

        if (!exerciseStats[exerciseId]) {
          exerciseStats[exerciseId] = {
            exercise_id: exerciseId,
            exercise_title: exerciseTitle,
            viewers: [],
            total_watch_times: [],
            completion_rates: [],
            sessions: [],
          };
        }

        exerciseStats[exerciseId].viewers.push(record);
        exerciseStats[exerciseId].total_watch_times.push(record.total_watch_time);
        exerciseStats[exerciseId].completion_rates.push(record.watch_percentage);
        exerciseStats[exerciseId].sessions.push(record.session_count);
      });

      // Calculate averages and format output
      return Object.values(exerciseStats).map((stats: any) => ({
        exercise_id: stats.exercise_id,
        exercise_title: stats.exercise_title,
        total_viewers: stats.viewers.length,
        avg_watch_time: stats.total_watch_times.reduce((a: number, b: number) => a + b, 0) / stats.total_watch_times.length,
        avg_completion_rate: stats.completion_rates.reduce((a: number, b: number) => a + b, 0) / stats.completion_rates.length,
        total_sessions: stats.sessions.reduce((a: number, b: number) => a + b, 0),
        avg_rewatch_count: stats.sessions.reduce((a: number, b: number) => a + b, 0) / stats.viewers.length,
        dropout_points: [], // TODO: Calculate dropout points
      })) as ExerciseVideoStats[];
    },
  });
};

// Get per-user video statistics
export const useUserVideoStats = () => {
  return useQuery({
    queryKey: ["user-video-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tracking")
        .select(`
          user_id,
          exercise_id,
          total_watch_time,
          watch_percentage,
          session_count,
          edu_knowledge_exercises(title)
        `);

      if (error) throw error;

      // Get user emails
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email");

      // Group by user and calculate stats
      const userStats: { [key: string]: any } = {};

      data?.forEach((record: any) => {
        const userId = record.user_id;

        if (!userStats[userId]) {
          const userProfile = profiles?.find(p => p.id === userId);
          userStats[userId] = {
            user_id: userId,
            user_email: userProfile?.email || "Unknown",
            total_watch_time: 0,
            videos_watched: 0,
            completion_rates: [],
            total_sessions: 0,
            exercises: {},
          };
        }

        userStats[userId].total_watch_time += record.total_watch_time;
        userStats[userId].videos_watched += 1;
        userStats[userId].completion_rates.push(record.watch_percentage);
        userStats[userId].total_sessions += record.session_count;
        userStats[userId].exercises[record.exercise_id] = {
          title: record.edu_knowledge_exercises?.title,
          watch_time: record.total_watch_time,
        };
      });

      // Format output
      return Object.values(userStats).map((stats: any) => {
        const mostWatchedExercise = Object.values(stats.exercises).reduce((max: any, current: any) => 
          current.watch_time > max.watch_time ? current : max, 
          { watch_time: 0, title: "None" }
        );

        return {
          user_id: stats.user_id,
          user_email: stats.user_email,
          total_watch_time: stats.total_watch_time,
          videos_watched: stats.videos_watched,
          avg_completion_rate: stats.completion_rates.reduce((a: number, b: number) => a + b, 0) / stats.completion_rates.length,
          total_sessions: stats.total_sessions,
          most_watched_exercise: mostWatchedExercise.title,
        };
      }) as UserVideoStats[];
    },
  });
};

// Helper functions for formatting
export const formatAnalyticsTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getCompletionColor = (percentage: number): string => {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const getCompletionBadgeVariant = (percentage: number) => {
  if (percentage >= 80) return "default";
  if (percentage >= 60) return "secondary";
  return "destructive";
};