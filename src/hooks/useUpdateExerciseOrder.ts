import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TablesUpdate } from "@/integrations/supabase/types";

export const useUpdateExerciseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exercises: { id: string; order_index: number }[]) => {
      // Use Promise.all to run updates in parallel for better performance
      const updatePromises = exercises.map(exercise =>
        supabase
          .from("edu_knowledge_exercises")
          .update({ 
            order_index: exercise.order_index,
            updated_at: new Date().toISOString() // Also update the timestamp
          })
          .eq("id", exercise.id)
      );

      const results = await Promise.all(updatePromises);

      // Check for any errors in the results
      const firstError = results.find(res => res.error);
      if (firstError) {
        throw firstError.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edu-exercises"] });
      toast({
        title: "Thành công",
        description: "Thứ tự bài học đã được cập nhật.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật thứ tự: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};