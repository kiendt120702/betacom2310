import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GeneralTrainingRecap {
  id: string;
  user_id: string;
  exercise_id: string;
  recap_content: string;
  created_at: string;
  updated_at: string;
}

export const useSubmitGeneralRecap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      recap_content: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: existingRecap, error: fetchError } = await supabase
        .from("general_training_recaps")
        .select("id")
        .eq("user_id", user.user.id)
        .eq("exercise_id", data.exercise_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result;
      let error;
      let isUpdate = false;

      if (existingRecap) {
        isUpdate = true;
        const updateResult = await supabase
          .from("general_training_recaps")
          .update({
            recap_content: data.recap_content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRecap.id)
          .select()
          .single();
        
        result = updateResult.data;
        error = updateResult.error;
      } else {
        const insertResult = await supabase
          .from("general_training_recaps")
          .insert({
            user_id: user.user.id,
            exercise_id: data.exercise_id,
            recap_content: data.recap_content,
          })
          .select()
          .single();
        
        result = insertResult.data;
        error = insertResult.error;
      }

      if (error) throw error;

      return { result, isUpdate };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["general-training-recap", data.result.exercise_id] });
      toast({
        title: "Thành công",
        description: data.isUpdate ? "Tóm tắt đã được cập nhật." : "Tóm tắt đã được lưu.",
      });
    },
    onError: (error: any) => {
      console.error("Submit general recap error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu tóm tắt.",
        variant: "destructive",
      });
    },
  });
};

export const useGetGeneralRecap = (exerciseId: string) => {
  return useQuery({
    queryKey: ["general-training-recap", exerciseId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from("general_training_recaps")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("exercise_id", exerciseId)
        .maybeSingle();

      if (error) throw error;
      return data as GeneralTrainingRecap | null;
    },
    enabled: !!exerciseId,
  });
};