
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

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStrategies = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
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
    setStrategies(prev => [data, ...prev]);
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
    setStrategies(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteStrategy = async (id: string) => {
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    fetchStrategies();
  }, [user]);

  return {
    strategies,
    loading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    refetch: fetchStrategies
  };
}
