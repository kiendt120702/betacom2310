import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EssayQuestion } from "@/integrations/supabase/types";

export type { EssayQuestion };

export const useEssayQuestions = (exerciseId: string | null) => {
  return useQuery<EssayQuestion[]>({
    queryKey: ["essay-questions", exerciseId],
    queryFn: async () => {
      if (!exerciseId) return [];
      const { data, error } = await supabase
        .from("edu_essay_questions")
        .select("*")
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!exerciseId,
  });
};

export const useAllEssayQuestions = () => {
  return useQuery<{ id: string; exercise_id: string; }[]>({
    queryKey: ["essay-questions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edu_essay_questions")
        .select("id, exercise_id");
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useCreateEssayQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (questionData: { exercise_id: string; content: string }) => {
      const { data, error } = await supabase
        .from("edu_essay_questions")
        .insert(questionData)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["essay-questions", variables.exercise_id] });
      queryClient.invalidateQueries({ queryKey: ["essay-questions", "all"] });
      toast({ title: "Thành công", description: "Đã thêm câu hỏi mới." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể thêm câu hỏi: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useUpdateEssayQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from("edu_essay_questions")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["essay-questions", data.exercise_id] });
      toast({ title: "Thành công", description: "Đã cập nhật câu hỏi." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể cập nhật câu hỏi: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useDeleteEssayQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from("edu_essay_questions").delete().eq("id", questionId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, questionId) => {
      // We don't know the exerciseId here, so we invalidate all essay question queries
      queryClient.invalidateQueries({ queryKey: ["essay-questions"] });
      toast({ title: "Thành công", description: "Đã xóa câu hỏi." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể xóa câu hỏi: ${error.message}`, variant: "destructive" });
    },
  });
};