import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Database['public']['Enums']['user_role'] | null;
  team: Database['public']['Enums']['team_type'] | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          updated_at,
          roles ( name ),
          teams ( name )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        created_at: data.created_at,
        updated_at: data.updated_at,
        role: (data.roles?.name as Database['public']['Enums']['user_role']) || null,
        team: (data.teams?.name as Database['public']['Enums']['team_type']) || null,
      };

      return userProfile;
    },
    enabled: !!user,
  });
};