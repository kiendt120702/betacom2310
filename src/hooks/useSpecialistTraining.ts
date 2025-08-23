import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export interface SpecialistTrainingExercise {
  id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  order_index: number;
  is_required: boolean;
  min_review_videos?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useSpecialistTraining = () => {
  return useQuery<SpecialistTrainingExercise[]>({
    queryKey: ["specialist-training"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialist_training_exercises")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateSpecialistTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; content?: string; video_url?: string; is_required?: boolean; min_review_videos?: number }) => {
      if (!user) throw new Error("User not authenticated");
      const { data: result, error } = await supabase
        .from("specialist_training_exercises")
        .insert({ ...data, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-training"] });
      toast({ title: "Thành công", description: "Đã tạo bài học Chuyên viên mới." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể tạo bài học: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useUpdateSpecialistTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { id: string; title?: string; description?: string; content?: string; video_url?: string; is_required?: boolean; min_review_videos?: number }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("specialist_training_exercises")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-training"] });
      toast({ title: "Thành công", description: "Đã cập nhật bài học Chuyên viên." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể cập nhật bài học: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useUpdateSpecialistTrainingVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { exerciseId: string; videoUrl: string | null }) => {
      const { error } = await supabase
        .from("specialist_training_exercises")
        .update({ video_url: data.videoUrl, updated_at: new Date().toISOString() })
        .eq("id", data.exerciseId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["specialist-training", variables.exerciseId] });
      queryClient.invalidateQueries({ queryKey: ["specialist-training"] });
      toast({ title: "Thành công", description: "Video bài học Chuyên viên đã được cập nhật." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể cập nhật video: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useDeleteSpecialistTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("specialist_training_exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-training"] });
      toast({ title: "Thành công", description: "Đã xóa bài học Chuyên viên." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể xóa bài học: ${error.message}`, variant: "destructive" });
    },
  });
};