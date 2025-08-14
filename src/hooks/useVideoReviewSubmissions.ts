import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VideoReviewSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  video_url: string;
  content: string | null; // Changed to allow null
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
      id?: string; // Thêm optional ID cho việc cập nhật
      exercise_id: string;
      video_url: string;
      content?: string | null; // Changed to allow null
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      if (data.id) {
        // Cập nhật bản nộp hiện có
        const { data: result, error } = await supabase
          .from("exercise_review_submissions")
          .update({
            video_url: data.video_url,
            content: data.content ?? null, // Use nullish coalescing
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Tạo bản nộp mới
        const { data: result, error } = await supabase
          .from("exercise_review_submissions")
          .insert({
            exercise_id: data.exercise_id,
            user_id: user.user.id,
            video_url: data.video_url,
            content: data.content ?? null, // Use nullish coalescing
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["video-review-submissions", variables.exercise_id] });
      toast({
        title: "Thành công",
        description: variables.id ? "Video ôn tập đã được cập nhật thành công" : "Video ôn tập đã được nộp thành công",
      });
    },
    onError: (error) => {
      console.error("Submit video review error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nộp/cập nhật video ôn tập",
        variant: "destructive",
      });
    },
  });
};