
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useVideoTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackVideoProgress = useMutation({
    mutationFn: async ({ 
      videoId, 
      currentTime, 
      duration, 
      isCompleted = false 
    }: { 
      videoId: string; 
      currentTime: number; 
      duration: number; 
      isCompleted?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Use user_video_progress table instead of video_tracking
      const { data, error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          watch_count: 1,
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate video progress queries
      queryClient.invalidateQueries({ queryKey: ["video-progress"] });
      queryClient.invalidateQueries({ queryKey: ["personal-learning-stats"] });
    },
  });

  return {
    trackVideoProgress: trackVideoProgress.mutate,
    isTracking: trackVideoProgress.isPending,
  };
};
