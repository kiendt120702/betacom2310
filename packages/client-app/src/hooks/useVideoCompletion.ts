
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMarkVideoCompleted = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_exercise_progress")
        .upsert({
          user_id: user.user.id,
          exercise_id: exerciseId,
          video_completed: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      toast({
        title: "Video hoàn thành",
        description: "Bạn đã xem hoàn thành video bài học",
      });
    },
    onError: (error) => {
      console.error("Mark video completed error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái video",
        variant: "destructive",
      });
    },
  });
};
