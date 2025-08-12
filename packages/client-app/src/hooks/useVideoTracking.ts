import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useVideoTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackVideoProgress = useMutation({
    mutationFn: async ({ 
      videoId, 
      courseId,
      currentTime, 
      duration, 
      isCompleted = false 
    }: { 
      videoId: string; 
      courseId: string;
      currentTime: number; 
      duration: number; 
      isCompleted?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          course_id: courseId,
          watch_count: 1,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-progress"] });
      queryClient.invalidateQueries({ queryKey: ["personal-learning-stats"] });
    },
  });

  return {
    trackVideoProgress: trackVideoProgress.mutate,
    isTracking: trackVideoProgress.isPending,
  };
};

// Utility function to format watch time
export const formatWatchTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};