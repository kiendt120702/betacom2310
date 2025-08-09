
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VideoReviewSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  video_url: string;
  content: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useVideoReviewSubmissions = (exerciseId?: string) => {
  return useQuery({
    queryKey: ["video-review-submissions", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("exercise_review_submissions")
        .select("*");

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId);
      }

      const { data, error } = await query.order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as VideoReviewSubmission[];
    },
  });
};

export const useSubmitVideoReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      exercise_id: string;
      video_url: string;
      content?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("exercise_review_submissions")
        .insert({
          user_id: user.user.id,
          exercise_id: data.exercise_id,
          video_url: data.video_url,
          content: data.content || 'Video ôn tập',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-review-submissions"] });
      toast({
        title: "Thành công",
        description: "Video ôn tập đã được nộp thành công",
      });
    },
    onError: (error) => {
      console.error("Submit video review error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nộp video ôn tập",
        variant: "destructive",
      });
    },
  });
};
