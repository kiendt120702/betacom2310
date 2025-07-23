import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type StrategyIndustry = Tables<'strategy_industries'>;

export const useStrategyIndustries = () => {
  const { data: industries = [], isLoading } = useQuery<StrategyIndustry[]>({
    queryKey: ['strategy_industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_industries')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
  });

  return { industries, isLoading };
};