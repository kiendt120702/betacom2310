import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export interface PracticeTestSubmission {
  id: string;
  user_id: string;
  practice_test_id: string;
  submitted_at: string;
  image_urls: string[];
  feedback: string | null;
  score: number | null;
  status: 'pending' | 'graded';
}

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

      // Check for existing submission to update it
      const { data: existingSubmission } = await supabase
        .from("practice_test_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("practice_test_id", data.practice_test_id)
        .maybeSingle();

      if (existingSubmission) {
        // Update
        const { data: result, error } = await supabase
          .from("practice_test_submissions")
          .update({
            image_urls: data.image_urls,
            submitted_at: new Date().toISOString(),
            status: 'pending', // Reset status on new submission
            score: null,
            feedback: null,
          })
          .eq("id", existingSubmission.id)
          .select()
          .single();
        if (error) throw error;
        return { ...result, isUpdate: true };
      } else {
        // Insert
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