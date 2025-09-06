import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbnailCategory } from "@/integrations/supabase/types/tables";

export type { ThumbnailCategory };

export const useThumbnailCategories = () => {
  return useQuery<ThumbnailCategory[]>({
    queryKey: ["thumbnail_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("thumbnail_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useCreateThumbnailCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("thumbnail_categories")
        .insert({ name })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_categories"] });
      toast({
        title: "Thành công",
        description: "Đã tạo danh mục mới.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message.includes("duplicate key value")
          ? "Tên danh mục đã tồn tại."
          : `Không thể tạo danh mục: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateThumbnailCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("thumbnail_categories")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_categories"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật danh mục.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật danh mục: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteThumbnailCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("thumbnail_categories").delete().eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thumbnail_categories"] });
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa danh mục: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};