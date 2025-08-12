import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./use-toast";

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

      // First check if recap already exists
      const { data: existingRecap } = await supabase
        .from("user_exercise_recaps")
        .select("id")
        .eq("user_id", user.user.id)
        .eq("exercise_id", data.exercise_id)
        .maybeSingle();

      let result;
      let error;

      if (existingRecap) {
        // Update existing recap
        const updateResult = await supabase
          .from("user_exercise_recaps")
          .update({
            recap_content: data.recap_content,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRecap.id)
          .select()
          .single();
        
        result = updateResult.data;
        error = updateResult.error;
      } else {
        // Create new recap
        const insertResult = await supabase
          .from("user_exercise_recaps")
          .insert({
            user_id: user.user.id,
            exercise_id: data.exercise_id,
            recap_content: data.recap_content,
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        result = insertResult.data;
        error = insertResult.error;
      }

      if (error) throw error;

      // Note: Progress update is now handled separately in the component

      return { result, isUpdate: !!existingRecap };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exercise-recaps"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-recap"] });
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress"] });
      toast({
        title: "Thành công",
        description: data?.isUpdate ? "Recap đã được cập nhật thành công" : "Recap đã được lưu thành công",
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

      if (error) throw error;
      return data as ExerciseRecap | null;
    },
    enabled: !!exerciseId,
  });
};