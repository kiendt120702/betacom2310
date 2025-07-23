import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface CustomStrategy extends Tables<'custom_strategies'> {}

export const useCustomStrategies = ({ page, pageSize = 15 }: { page: number; pageSize?: number }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ strategies: CustomStrategy[]; count: number } | null>({
    queryKey: ['custom_strategies', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('custom_strategies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }
      return { strategies: data as unknown as CustomStrategy[], count: count ?? 0 };
    },
  });

  const createStrategy = useMutation({
    mutationFn: async (strategy: TablesInsert<'custom_strategies'>) => {
      const { data, error } = await supabase
        .from('custom_strategies')
        .insert(strategy)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_strategies'] });
      toast.success('Đã tạo chiến lược mới thành công!');
    },
    onError: (error) => {
      toast.error('Không thể tạo chiến lược mới.', { description: error.message });
    },
  });

  const updateStrategy = useMutation({
    mutationFn: async ({ id, ...strategy }: { id: string } & TablesUpdate<'custom_strategies'>) => {
      const { data, error } = await supabase
        .from('custom_strategies')
        .update({ ...strategy, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_strategies'] });
      toast.success('Đã cập nhật chiến lược thành công!');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật chiến lược.', { description: error.message });
    },
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_strategies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_strategies'] });
      toast.success('Đã xóa chiến lược thành công!');
    },
    onError: (error) => {
      toast.error('Không thể xóa chiến lược.', { description: error.message });
    },
  });

  const bulkCreateStrategies = useMutation({
    mutationFn: async (strategiesToInsert: TablesInsert<'custom_strategies'>[]) => {
      const { data, error } = await supabase
        .from('custom_strategies')
        .insert(strategiesToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom_strategies'] });
      toast.success(`Đã thêm ${data?.length || 0} chiến lược mới thành công!`);
    },
    onError: (error) => {
      toast.error('Không thể thêm chiến lược hàng loạt.', { description: error.message });
    },
  });

  return {
    strategies: data?.strategies ?? [],
    totalCount: data?.count ?? 0,
    isLoading,
    error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    bulkCreateStrategies,
  };
};