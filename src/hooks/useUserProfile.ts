import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserRole, TeamType } from './types/userTypes'; // Import types

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role_id: string | null; // Now UUID
  team_id: string | null; // Now UUID
  role: UserRole | null; // Actual role name from joined table
  team: TeamType | null; // Actual team name from joined table
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
          *,
          roles ( name ),
          teams ( name )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      // Map the data to the UserProfile interface, extracting role and team names
      const userProfile: UserProfile = {
        ...data,
        role: (data.roles as { name: UserRole } | null)?.name || null,
        team: (data.teams as { name: TeamType } | null)?.name || null,
      };

      return userProfile;
    },
    enabled: !!user,
  });
};