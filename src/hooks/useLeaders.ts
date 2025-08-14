
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Leader {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useLeaders = () => {
  return useQuery({
    queryKey: ['leaders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Leader[];
    },
  });
};

export const useCreateLeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('leaders')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders'] });
      toast.success("Thêm leader thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm leader");
    },
  });
};

export const useUpdateLeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('leaders')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders'] });
      toast.success("Cập nhật leader thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật leader");
    },
  });
};

export const useDeleteLeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leaders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders'] });
      toast.success("Xóa leader thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa leader");
    },
  });
};
