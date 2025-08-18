import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type FeedbackSubmission = Tables<'feedback_submissions'> & {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
};

// Hook to submit feedback
export const useSubmitFeedback = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData: {
      content: string;
      image_url?: string | null;
      page_url: string;
      user_id: string;
    }) => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .insert([feedbackData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cảm ơn bạn! Phản hồi của bạn đã được gửi đi.",
      });
      queryClient.invalidateQueries({ queryKey: ["feedback_submissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể gửi phản hồi: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for admins to get feedback submissions
export const useGetFeedbackSubmissions = () => {
  return useQuery<FeedbackSubmission[]>({
    queryKey: ["feedback_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FeedbackSubmission[];
    },
  });
};

// Hook for admins to update feedback status
export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'new' | 'in_progress' | 'resolved' }) => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback_submissions"] });
      toast({
        title: "Thành công",
        description: "Trạng thái feedback đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};