import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { PracticeTestSubmission } from "@/integrations/supabase/types";

export type { PracticeTestSubmission };

export type PracticeTestSubmissionWithDetails = PracticeTestSubmission & {
  profiles: { full_name: string | null; email: string } | null;
  practice_tests: {
    title: string;
    edu_knowledge_exercises: { title: string } | null;
  } | null;
};

// Hook to get submissions for a practice test
export const usePracticeTestSubmissions = (practiceTestId: string | null) => {
  const { user } = useAuth();
  return useQuery<PracticeTestSubmission[]>({
    queryKey: ["practice-test-submissions", practiceTestId, user?.id],
    queryFn: async () => {
      if (!practiceTestId || !user) return [];
      const { data, error } = await supabase
        .from("practice_test_submissions")
        .select("*")
        .eq("practice_test_id", practiceTestId)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as PracticeTestSubmission[];
    },
    enabled: !!practiceTestId && !!user,
  });
};

// Hook to submit/update a submission
export const useSubmitPracticeTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      practice_test_id: string;
      image_urls: string[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existingSubmission } = await supabase
        .from("practice_test_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("practice_test_id", data.practice_test_id)
        .maybeSingle();

      if (existingSubmission) {
        const { data: result, error } = await supabase
          .from("practice_test_submissions")
          .update({
            image_urls: data.image_urls,
            submitted_at: new Date().toISOString(),
            status: 'pending',
            score: null,
            feedback: null,
          })
          .eq("id", existingSubmission.id)
          .select()
          .single();
        if (error) throw error;
        return { ...result, isUpdate: true };
      } else {
        const { data: result, error } = await supabase
          .from("practice_test_submissions")
          .insert({
            user_id: user.id,
            practice_test_id: data.practice_test_id,
            image_urls: data.image_urls,
          })
          .select()
          .single();
        if (error) throw error;
        return { ...result, isUpdate: false };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["practice-test-submissions", data.practice_test_id] });
      toast({
        title: "Thành công",
        description: data.isUpdate ? "Bài làm đã được cập nhật." : "Bài làm đã được nộp.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể nộp bài: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook to get all submissions for admin/grading view
export const useAllPracticeTestSubmissions = () => {
  return useQuery<PracticeTestSubmissionWithDetails[]>({
    queryKey: ["all-practice-test-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practice_test_submissions")
        .select(`
          *,
          profiles (full_name, email),
          practice_tests (
            title,
            edu_knowledge_exercises (title)
          )
        `)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PracticeTestSubmissionWithDetails[];
    },
  });
};

// Hook to grade a submission
export const useGradePracticeTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      score: number;
      feedback: string;
    }) => {
      const { error } = await supabase
        .from("practice_test_submissions")
        .update({
          score: data.score,
          feedback: data.feedback,
          status: 'graded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.submissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-practice-test-submissions"] });
      toast({ title: "Thành công", description: "Đã chấm điểm và lưu kết quả." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể lưu điểm: ${error.message}`, variant: "destructive" });
    },
  });
};