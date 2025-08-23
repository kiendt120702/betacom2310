import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type EssaySubmission = Tables<'edu_essay_submissions'>;

export type EssaySubmissionWithDetails = EssaySubmission & {
  profiles: { full_name: string | null; email: string } | null;
  edu_knowledge_exercises: { title: string } | null;
};

// Hook to get a user's submission for a specific exercise
export const useUserEssaySubmission = (exerciseId: string | null) => {
  const { user } = useAuth();
  return useQuery<EssaySubmission | null>({
    queryKey: ["essay-submission", exerciseId, user?.id],
    queryFn: async () => {
      if (!exerciseId || !user) return null;
      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .select("*")
        .eq("exercise_id", exerciseId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!exerciseId && !!user,
  });
};

// Hook to get all submissions for admin view
export const useAllEssaySubmissions = (exerciseId?: string | null) => {
  return useQuery<EssaySubmissionWithDetails[]>({
    queryKey: ["all-essay-submissions", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("edu_essay_submissions")
        .select(`
          *,
          profiles (full_name, email),
          edu_knowledge_exercises (title)
        `)
        .order("submitted_at", { ascending: false });

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EssaySubmissionWithDetails[];
    },
  });
};

// Hook to start the essay test
export const useStartEssayTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { exercise_id: string; time_limit?: number }) => {
      const { data: result, error } = await supabase.rpc('start_essay_test', {
        p_exercise_id: data.exercise_id,
        p_time_limit: data.time_limit || 30,
      });
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["essay-submission", variables.exercise_id], data);
      queryClient.invalidateQueries({ queryKey: ["essay-submission", variables.exercise_id] });
      toast({ title: "Bắt đầu làm bài!", description: "Chúc bạn làm bài tốt." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể bắt đầu bài test: ${error.message}`, variant: "destructive" });
    },
  });
};

// Hook to submit answers
export const useSubmitEssayAnswers = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (submissionData: {
      submission_id: string;
      exercise_id: string;
      answers: { id: string; content: string; answer: string }[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("edu_essay_submissions")
        .update({
          answers: submissionData.answers,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submissionData.submission_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["essay-submission", variables.exercise_id, user?.id] });
      toast({ title: "Thành công", description: "Đã nộp bài tự luận." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể nộp bài: ${error.message}`, variant: "destructive" });
    },
  });
};