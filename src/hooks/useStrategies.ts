
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Strategy {
  id: string;
  user_id: string;
  strategy: string;
  implementation: string;
  created_at: string;
  updated_at: string;
}

interface CreateStrategyData {
  strategy: string;
  implementation: string;
}

export const useStrategies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching strategies:', error);
        throw error;
      }

      return data as Strategy[];
    },
  });

  const createStrategyMutation = useMutation({
    mutationFn: async (strategyData: CreateStrategyData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('strategies')
        .insert({
          user_id: userData.user.id,
          strategy: strategyData.strategy,
          implementation: strategyData.implementation,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: "Chiến lược đã được tạo thành công.",
      });
    },
    onError: (error) => {
      console.error('Error creating strategy:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo chiến lược.",
        variant: "destructive",
      });
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateStrategyData>) => {
      const { data, error } = await supabase
        .from('strategies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
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
        description: "Chiến lược đã được cập nhật.",
      });
    },
    onError: (error) => {
      console.error('Error updating strategy:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chiến lược.",
        variant: "destructive",
      });
    },
  });

  const deleteStrategyMutation = useMutation({
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
        description: "Chiến lược đã được xóa.",
      });
    },
    onError: (error) => {
      console.error('Error deleting strategy:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa chiến lược.",
        variant: "destructive",
      });
    },
  });

  const bulkCreateStrategiesMutation = useMutation({
    mutationFn: async (strategies: CreateStrategyData[]) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const strategiesWithUser = strategies.map(strategy => ({
        ...strategy,
        user_id: userData.user.id,
      }));

      const { data, error } = await supabase
        .from('strategies')
        .insert(strategiesWithUser)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: `Đã tạo ${data.length} chiến lược thành công.`,
      });
    },
    onError: (error) => {
      console.error('Error bulk creating strategies:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo chiến lược hàng loạt.",
        variant: "destructive",
      });
    },
  });

  return {
    strategies,
    isLoading,
    createStrategy: createStrategyMutation.mutate,
    updateStrategy: updateStrategyMutation.mutate,
    deleteStrategy: deleteStrategyMutation.mutate,
    bulkCreateStrategies: bulkCreateStrategiesMutation.mutate,
    isCreating: createStrategyMutation.isPending,
    isUpdating: updateStrategyMutation.isPending,
    isDeleting: deleteStrategyMutation.isPending,
    isBulkCreating: bulkCreateStrategiesMutation.isPending,
  };
};
