import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TablesUpdate } from "@/integrations/supabase/types";

export const useUpdateExerciseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exercises: { id: string; order_index: number }[]) => {
      const { error } = await supabase
        .from("edu_knowledge_exercises")
        .upsert(exercises as TablesUpdate<'edu_knowledge_exercises'>[]);

      if (error) throw new Error(error.message);
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