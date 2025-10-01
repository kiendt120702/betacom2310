import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type Tag = Tables<'tags'>;

export const useTags = () => {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Thành công",
        description: "Đã tạo tag mới.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message.includes("duplicate key value")
          ? "Tên tag đã tồn tại."
          : `Không thể tạo tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật tag.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({
        title: "Thành công",
        description: "Đã xóa tag.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};