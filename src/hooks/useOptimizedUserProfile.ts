
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OptimizedUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'leader' | 'chuyên viên';
  team_id: string | null;
  created_at: string;
  updated_at: string;
  teams: {
    id: string;
    name: string;
  } | null;
}

export const useOptimizedUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<OptimizedUserProfile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, teams(id, name)')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data as OptimizedUserProfile;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};
