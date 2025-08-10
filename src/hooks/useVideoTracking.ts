import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VideoTrackingData {
  id: string;
  user_id: string;
  exercise_id: string;
  total_watch_time: number;
  video_duration: number;
  watch_percentage: number;
  last_position: number;
  session_count: number;
  created_at: string;
  updated_at: string;
}

export const useVideoTracking = (exerciseId: string) => {
  return useQuery({
    queryKey: ["video-tracking", exerciseId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("video_tracking")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("exercise_id", exerciseId)
        .maybeSingle();

      if (error) throw error;
      return data as VideoTrackingData | null;
    },
    enabled: !!exerciseId,
  });
};

export const useUpdateVideoTracking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      total_watch_time: number;
      video_duration: number;
      watch_percentage: number;
      last_position: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get existing tracking data to increment session count
      const { data: existing } = await supabase
        .from("video_tracking")
        .select("session_count")
        .eq("user_id", user.user.id)
        .eq("exercise_id", data.exercise_id)
        .maybeSingle();

      const sessionCount = (existing?.session_count || 0) + 1;

      const { data: result, error } = await supabase
        .from("video_tracking")
        .upsert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          total_watch_time: Math.round(data.total_watch_time),
          video_duration: Math.round(data.video_duration),
          watch_percentage: Math.round(data.watch_percentage * 100), // Store as percentage (0-100)
          last_position: Math.round(data.last_position),
          session_count: sessionCount,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["video-tracking"] });
      console.log("Video tracking updated:", result);
    },
    onError: (error) => {
      console.error("Video tracking error:", error);
      // Don't show toast for tracking errors to avoid interrupting user experience
    },
  });
};

// Helper function to format watch time
export const formatWatchTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Helper function to calculate watch efficiency
export const calculateWatchEfficiency = (totalWatchTime: number, videoDuration: number): number => {
  if (videoDuration === 0) return 0;
  return Math.min((totalWatchTime / videoDuration) * 100, 100);
};