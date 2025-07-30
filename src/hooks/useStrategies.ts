import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export interface Strategy {
  id: string;
  strategy: string;
  implementation: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UseStrategiesParams {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export const useStrategies = ({ page, pageSize, searchTerm }: UseStrategiesParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['strategies', user?.id, page, pageSize, searchTerm],
    queryFn: async () => {
      if (!user) return { strategies: [], totalCount: 0 };
      
      let query = supabase
        .from('strategies')
        .select('*', { count: 'exact' }); // Removed .eq('user_id', user.id)

      if (searchTerm) {
        query = query.or(`strategy.ilike.%${searchTerm}%,implementation.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { strategies: data || [], totalCount: count || 0 };
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (strategyData: { strategy: string; implementation: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('strategies')
        .insert([{
          ...strategyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: "Đã thêm chiến lược mới thành công"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { strategy: string; implementation: string } }) => {
      const { data, error } = await supabase
        .from('strategies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật chiến lược thành công"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteStrategy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: "Đã xóa chiến lược thành công"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chiến lược",
        variant: "destructive"
      });
    }
  });
};