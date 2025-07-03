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
      console.log('useUserProfile: Query function started. User:', user?.id);
      if (!user) {
        console.log('useUserProfile: No user found, returning null.');
        return null;
      }
      
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

      if (fetchError && fetchError.code === 'PGRST116') { // PGRST116 means no rows found
        console.warn('useUserProfile: User profile not found. Attempting to create a default profile.');
        
        // Fetch default role ID for 'chuyên viên'
        const { data: defaultRole, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'chuyên viên')
          .single();

        if (roleError || !defaultRole) {
          console.error('useUserProfile: Error fetching default role for new profile:', roleError);
          throw new Error('Could not create default profile: default role "chuyên viên" not found in database.');
        }

        // Insert new profile with default role
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.email!.split('@')[0],
            role_id: defaultRole.id,
            team_id: null,
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
          console.error('useUserProfile: Error creating default profile:', insertError);
          throw insertError;
        }
        profileData = newProfile; // Use the newly created profile data
        console.log('useUserProfile: Default profile created successfully:', profileData);
      } else if (fetchError) {
        console.error('useUserProfile: Error fetching user profile:', fetchError);
        throw fetchError;
      }

      if (!profileData) {
        console.error('useUserProfile: profileData is null/undefined after fetch/create attempt.');
        return null;
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        role: (profileData.roles?.name as Database['public']['Enums']['user_role']) || null,
        team: (profileData.teams?.name as Database['public']['Enums']['team_type']) || null,
      };
      console.log('useUserProfile: Profile successfully retrieved/created and mapped:', userProfile);
      return userProfile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    retry: 1, // Retry once on failure
  });
};