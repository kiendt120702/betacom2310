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
        }, { onConflict: 'user_id,exercise_id' })
        .select()
        .single();

      if (error) throw error;

      return { result, isUpdate: false }; // Can't easily tell if it was insert or update with upsert.
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exercise-recaps"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-recap", data.result.exercise_id] });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      toast({
        title: "Thành công",
        description: "Tóm tắt của bạn đã được lưu.",
      });
    },
    onError: (error: any) => {
      console.error("Submit recap error:", error);
      
      let errorMessage = "Không thể lưu recap";
      
      // Provide more specific error messages based on the error
      if (error?.message?.includes("not authenticated")) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error?.message?.includes("permission")) {
        errorMessage = "Không có quyền truy cập. Vui lòng liên hệ quản trị viên.";
      } else if (error?.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      toast({
        title: "Lỗi lưu recap",
        description: errorMessage,
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

      if (error) throw new Error(error.message);
      return data as ExerciseRecap | null;
    },
    enabled: !!exerciseId,
  });
};