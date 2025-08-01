import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BannerType {
  id: string;
  name: string;
  created_at: string;
}

export const useBannerTypes = () => {
  return useQuery<BannerType[]>({
    queryKey: ["banner-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBannerType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("banner_types")
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-types"] });
      toast({
        title: "Thành công",
        description: "Đã tạo loại thumbnail mới.",
      });
    },
    onError: (error: any) => {
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

export const useUpdateBannerType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("banner_types")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-types"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật loại thumbnail.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật loại thumbnail: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBannerType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banner_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-types"] });
      toast({
        title: "Thành công",
        description: "Đã xóa loại thumbnail.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa loại thumbnail: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
