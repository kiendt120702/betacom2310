import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type Team = Tables<'sys_departments'>;

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ["teams"], // Giữ nguyên queryKey để tương thích
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sys_departments") // Đổi từ "departments" sang "sys_departments"
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("sys_departments") // Đổi từ "departments" sang "sys_departments"
        .insert({ name })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã tạo phòng ban mới.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message.includes("duplicate key value")
          ? "Tên phòng ban đã tồn tại."
          : `Không thể tạo phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("sys_departments") // Đổi từ "departments" sang "sys_departments"
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật phòng ban.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sys_departments").delete().eq("id", id); // Đổi từ "departments" sang "sys_departments"

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Thành công",
        description: "Đã xóa phòng ban.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể xóa phòng ban: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};