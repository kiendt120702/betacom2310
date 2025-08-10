
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoAnalytics {
  totalViews: number;
  uniqueUsers: number;
  averageWatchTime: number;
  completionRate: number;
  totalSessions: number;
  topVideos: Array<{
    video_id: string;
    title: string;
    views: number;
  }>;
}

export const useVideoAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["video-analytics", startDate, endDate],
    queryFn: async () => {
      // Get video progress data
      let query = supabase
        .from("user_video_progress")
        .select(`
          *,
          training_videos(title)
        `);

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data: videoProgress, error } = await query;

      if (error) throw error;

      const totalViews = videoProgress?.reduce((acc, v) => acc + v.watch_count, 0) || 0;
      const uniqueUsers = new Set(videoProgress?.map(v => v.user_id) || []).size;
      const completedViews = videoProgress?.filter(v => v.is_completed).length || 0;
      const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;
      const averageWatchTime = videoProgress?.length > 0 
        ? videoProgress.reduce((acc, v) => acc + (v.watch_count * 5), 0) / videoProgress.length 
        : 0; // Estimate 5 min per view
      const totalSessions = totalViews;

      // Calculate top videos
      const videoStats = new Map();
      videoProgress?.forEach(v => {
        const key = v.video_id;
        if (!videoStats.has(key)) {
          videoStats.set(key, {
            video_id: v.video_id,
            title: (v as any).training_videos?.title || 'Unknown',
            views: 0
          });
        }
        videoStats.get(key).views += v.watch_count;
      });

      const topVideos = Array.from(videoStats.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      const analytics: VideoAnalytics = {
        totalViews,
        uniqueUsers,
        averageWatchTime,
        completionRate,
        totalSessions,
        topVideos
      };

      return analytics;
    },
  });
};
