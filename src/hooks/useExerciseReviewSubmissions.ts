
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ExerciseReviewSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  content: string;
  video_url: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useExerciseReviewSubmissions = (exerciseId?: string) => {
  return useQuery({
    queryKey: ["exercise-review-submissions", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("exercise_review_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExerciseReviewSubmission[];
    },
  });
};

export const useCreateReviewSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      content: string;
      video_url: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("exercise_review_submissions")
        .insert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          content: data.content,
          video_url: data.video_url,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-review-submissions"] });
      toast({
        title: "Thành công",
        description: "Video ôn tập đã được nộp thành công",
      });
    },
    onError: (error) => {
      console.error("Create review submission error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nộp video ôn tập",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReviewSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("exercise_review_submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-review-submissions"] });
      toast({
        title: "Thành công",
        description: "Video ôn tập đã được xóa",
      });
    },
    onError: (error) => {
      console.error("Delete review submission error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa video ôn tập",
        variant: "destructive",
      });
    },
  });
};
