import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbnailType } from "@/integrations/supabase/types/tables";

export type { ThumbnailType };

export const useThumbnailTypes = () => {
  return useQuery<ThumbnailType[]>({
    queryKey: ["thumbnail_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thumbnail_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useCreateThumbnailType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("thumbnail_types")
        .insert({ name })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_types"] });
      toast({
        title: "Thành công",
        description: "Đã tạo loại thumbnail mới.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message.includes("duplicate key value")
          ? "Tên loại thumbnail đã tồn tại."
          : `Không thể tạo loại thumbnail: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateThumbnailType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("thumbnail_types")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_types"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật loại thumbnail.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật loại thumbnail: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteThumbnailType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("thumbnail_types")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_types"] });
      toast({
        title: "Thành công",
        description: "Đã xóa loại thumbnail.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa loại thumbnail: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};