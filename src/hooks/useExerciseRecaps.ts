
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ExerciseRecap {
  id: string;
  user_id: string;
  exercise_id: string;
  recap_content: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useExerciseRecaps = (exerciseId?: string) => {
  return useQuery({
    queryKey: ["exercise-recaps", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("user_exercise_recaps")
        .select("*");

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId);
      }

      const { data, error } = await query.order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as ExerciseRecap[];
    },
  });
};

export const useSubmitRecap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      recap_content: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_exercise_recaps")
        .upsert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          recap_content: data.recap_content,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Cập nhật trạng thái recap_submitted trong user_exercise_progress
      await supabase
        .from("user_exercise_progress")
        .upsert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          recap_submitted: true,
          updated_at: new Date().toISOString(),
        });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-recaps"] });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      toast({
        title: "Thành công",
        description: "Recap đã được gửi thành công",
      });
    },
    onError: (error) => {
      console.error("Submit recap error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi recap",
        variant: "destructive",
      });
    },
  });
};

export const useGetExerciseRecap = (exerciseId: string) => {
  return useQuery({
    queryKey: ["exercise-recap", exerciseId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_exercise_recaps")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("exercise_id", exerciseId)
        .maybeSingle();

      if (error) throw error;
      return data as ExerciseRecap | null;
    },
    enabled: !!exerciseId,
  });
};
