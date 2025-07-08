
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemUpdate {
  id: string;
  type: 'cải tiến' | 'thiết kế lại' | 'tính năng mới' | 'cập nhật' | 'sửa lỗi';
  title: string;
  description: string;
  version: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useSystemUpdates = () => {
  return useQuery({
    queryKey: ['system-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SystemUpdate[];
    },
  });
};

export const useCreateSystemUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (update: Omit<SystemUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('system_updates')
        .insert([update])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-updates'] });
    },
  });
};
