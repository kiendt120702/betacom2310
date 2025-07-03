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
      
      let { data: profileData, error: fetchError } = await supabase
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

      // If profile not found, create a default one
      if (fetchError && fetchError.code === 'PGRST116') { // PGRST116 means no rows found
        console.warn('User profile not found. Attempting to create a default profile.');
        
        // Fetch default role ID for 'chuyên viên'
        const { data: defaultRole, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'chuyên viên')
          .single();

        if (roleError || !defaultRole) {
          console.error('Error fetching default role for new profile:', roleError);
          throw new Error('Could not create default profile: default role "chuyên viên" not found in database.');
        }

        // Insert new profile with default role
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!, // user.email should exist if user is not null
            full_name: user.user_metadata.full_name || user.email!.split('@')[0], // Use existing full_name or derive from email
            role_id: defaultRole.id,
            team_id: null, // Default to no team
          })
          .select(`
            id,
            email,
            full_name,
            created_at,
            updated_at,
            roles ( name ),
            teams ( name )
          `)
          .single();

        if (insertError) {
          console.error('Error creating default profile:', insertError);
          throw insertError;
        }
        profileData = newProfile; // Use the newly created profile data
      } else if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw fetchError;
      }

      // Now, process profileData (either fetched or newly created)
      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        role: (profileData.roles?.name as Database['public']['Enums']['user_role']) || null,
        team: (profileData.teams?.name as Database['public']['Enums']['team_type']) || null,
      };

      return userProfile;
    },
    enabled: !!user,
  });
};