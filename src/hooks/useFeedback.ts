import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables, Enums } from "@/types/supabase";
import { useAuth } from "./useAuth";

export type Feedback = Tables<'feedback'> & {
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
};
export type FeedbackStatus = Enums<'feedback_status'>;
export type FeedbackType = Enums<'feedback_type'>; // Keep this type for now as it's still in DB schema

interface CreateFeedbackData {
  content: string;
  image_url?: string | null;
  // Removed feedback_type from here
}

interface UpdateFeedbackData {
  id: string;
  status?: FeedbackStatus;
  resolved_by?: string | null;
  resolved_at?: string | null;
}

export const useFeedback = (filters?: { status?: FeedbackStatus | 'all' }) => { // Removed type filter
  const { user } = useAuth();
  return useQuery<Feedback[]>({
    queryKey: ["feedback", user?.id, filters],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("feedback")
        .select(`*, profiles(full_name, email)`)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      // Removed type filter application
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Feedback[];
    },
    enabled: !!user,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateFeedbackData) => {
      if (!user) throw new Error("User not authenticated");
      const { data: newFeedback, error } = await supabase
        .from("feedback")
        .insert({
          user_id: user.id,
          content: data.content,
          image_url: data.image_url || null,
          feedback_type: 'general', // Default to 'general' as type is no longer selected by user
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return newFeedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Gửi góp ý thành công",
        description: "Cảm ơn bạn đã đóng góp!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể gửi góp ý: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateFeedbackData) => {
      if (!user) throw new Error("User not authenticated");
      const { data: updatedFeedback, error } = await supabase
        .from("feedback")
        .update({
          status: data.status,
          resolved_by: data.resolved_by,
          resolved_at: data.resolved_at,
        })
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updatedFeedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Cập nhật feedback thành công",
        description: "Trạng thái feedback đã được thay đổi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật feedback: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Xóa feedback thành công",
        description: "Feedback đã được xóa khỏi hệ thống.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa feedback: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};