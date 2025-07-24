import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export function useStrategies({ page, pageSize, searchTerm }: UseStrategiesParams) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStrategies = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let query = supabase
        .from('strategies')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (searchTerm) {
        query = query.or(`strategy.ilike.%${searchTerm}%,implementation.ilike.%${searchTerm}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setStrategies(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async (strategyData: { strategy: string; implementation: string }) => {
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
    // No need to update local state directly, refetch will handle it
    return data;
  };

  const updateStrategy = async (id: string, updates: { strategy: string; implementation: string }) => {
    const { data, error } = await supabase
      .from('strategies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    // No need to update local state directly, refetch will handle it
    return data;
  };

  const deleteStrategy = async (id: string) => {
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    // No need to update local state directly, refetch will handle it
  };

  useEffect(() => {
    fetchStrategies();
  }, [user, page, pageSize, searchTerm]); // Re-fetch when these dependencies change

  return {
    strategies,
    totalCount,
    loading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    refetch: fetchStrategies // Expose refetch for manual trigger
  };
}