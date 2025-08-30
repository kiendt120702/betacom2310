import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { GeneralTrainingExercise } from "@/integrations/supabase/types";

export { type GeneralTrainingExercise };

export const useGeneralTraining = () => {
  return useQuery<GeneralTrainingExercise[]>({
    queryKey: ["general-training"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("general_training_exercises")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateGeneralTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title: string; video_url?: string; target_roles?: string[]; target_team_ids?: string[]; tags?: string[] }) => {
      if (!user) throw new Error("User not authenticated");
      const { data: result, error } = await supabase
        .from("general_training_exercises")
        .insert({ ...data, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-training"] });
      toast({ title: "Thành công", description: "Đã tạo bài học chung mới." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể tạo bài học: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useUpdateGeneralTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { id: string; title?: string; video_url?: string; target_roles?: string[]; target_team_ids?: string[]; tags?: string[] }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("general_training_exercises")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-training"] });
      toast({ title: "Thành công", description: "Đã cập nhật bài học." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể cập nhật bài học: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useUpdateGeneralTrainingVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { exerciseId: string; videoUrl: string | null }) => {
      const { error } = await supabase
        .from("general_training_exercises")
        .update({ video_url: data.videoUrl, updated_at: new Date().toISOString() })
        .eq("id", data.exerciseId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["general-training", variables.exerciseId] });
      queryClient.invalidateQueries({ queryKey: ["general-training"] });
      toast({ title: "Thành công", description: "Video bài học đã được cập nhật." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể cập nhật video: ${error.message}`, variant: "destructive" });
    },
  });
};

export const useDeleteGeneralTraining = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("general_training_exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-training"] });
      toast({ title: "Thành công", description: "Đã xóa bài học." });
    },
    onError: (error: Error) => {
      toast({ title: "Lỗi", description: `Không thể xóa bài học: ${error.message}`, variant: "destructive" });
    },
  });
};