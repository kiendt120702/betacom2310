
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Strategy {
  id: string;
  title: string;
  category: string;
  industry: string;
  target_audience: string;
  objective: string;
  strategy_steps: string[];
  benefits: string[];
  kpis: string[];
  explanation: string;
  context_info?: string;
  tags: string[];
  difficulty_level: number;
  estimated_time?: string;
  success_rate: number;
  content_embedding?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface StrategyCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface StrategyIndustry {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useStrategies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_strategies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Strategy[];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['strategy-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StrategyCategory[];
    }
  });

  const { data: industries = [] } = useQuery({
    queryKey: ['strategy-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_industries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StrategyIndustry[];
    }
  });

  const createStrategy = useMutation({
    mutationFn: async (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('shopee_strategies')
        .insert([strategy])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: "Thành công",
        description: "Đã thêm chiến lược mới",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm chiến lược",
        variant: "destructive",
      });
      console.error('Error creating strategy:', error);
    }
  });

  return {
    strategies,
    categories,
    industries,
    isLoading,
    createStrategy
  };
};
