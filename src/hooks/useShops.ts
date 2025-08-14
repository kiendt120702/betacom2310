
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Shop {
  id: string;
  name: string;
  personnel_id: string | null;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
  personnel?: {
    name: string;
  };
  leaders?: {
    name: string;
  };
}

export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          personnel (
            name
          ),
          leaders (
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data as Shop[];
    },
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, personnel_id, leader_id }: { 
      name: string; 
      personnel_id: string | null; 
      leader_id: string | null; 
    }) => {
      const { data, error } = await supabase
        .from('shops')
        .insert({ name, personnel_id, leader_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success("Thêm shop thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm shop");
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, personnel_id, leader_id }: { 
      id: string;
      name: string; 
      personnel_id: string | null; 
      leader_id: string | null; 
    }) => {
      const { data, error } = await supabase
        .from('shops')
        .update({ name, personnel_id, leader_id })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success("Cập nhật shop thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật shop");
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success("Xóa shop thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa shop");
    },
  });
};
