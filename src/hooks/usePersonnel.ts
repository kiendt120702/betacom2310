
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Personnel {
  id: string;
  name: string;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
  leaders?: {
    name: string;
  };
}

export const usePersonnel = () => {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personnel')
        .select(`
          *,
          leaders (
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data as Personnel[];
    },
  });
};

export const useCreatePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, leader_id }: { name: string; leader_id: string | null }) => {
      const { data, error } = await supabase
        .from('personnel')
        .insert({ name, leader_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success("Thêm nhân sự thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm nhân sự");
    },
  });
};

export const useUpdatePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, leader_id }: { id: string; name: string; leader_id: string | null }) => {
      const { data, error } = await supabase
        .from('personnel')
        .update({ name, leader_id })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success("Cập nhật nhân sự thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật nhân sự");
    },
  });
};

export const useDeletePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success("Xóa nhân sự thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa nhân sự");
    },
  });
};
