import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';
import { Database } from '@/integrations/supabase/types';

type TeamType = Database['public']['Enums']['team_type'];
type UserRole = Database['public']['Enums']['user_role'];

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  team: TeamType;
}

interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: UserRole;
  team?: TeamType;
}

export const useUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'deleted')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as UserProfile[];
    },
    enabled: !!user,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {

      // Store current session to restore later
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found. Admin session required to create users.');
      }

      try {
        // Attempt to sign up the new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              full_name: userData.full_name,
              role: userData.role,
              team: userData.team,
            }
          }
        });

        if (authError) {
          // Handle "User already registered" specifically
          if (authError.message === 'User already registered') {
            
            // Call the new Edge Function to create/update the profile for the existing user
            const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('manage-user-profile', {
              body: {
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role,
                team: userData.team,
              }
            });

            if (edgeFunctionError || edgeFunctionData?.error) {
              const errMsg = edgeFunctionError?.message || edgeFunctionData?.error || 'Failed to manage user profile via Edge Function';
              throw new Error(`Không thể quản lý hồ sơ người dùng: ${errMsg}`);
            }

            // We don't get the user object back directly, but the profile is handled.
            // For simplicity, we can return a success indicator or refetch users.
            return { success: true, message: 'Profile managed for existing user' };

          } else {
            // Re-throw other authentication errors
            throw authError;
          }
        }

        if (!authData.user) {
          throw new Error('Không thể tạo người dùng mới.');
        }

        // Profile should be created by trigger for new signups
        return authData.user;

      } finally {
        // Always restore admin session to prevent logout
        const { error: sessionRestoreError } = await supabase.auth.setSession(currentSession.session);
        if (sessionRestoreError) {
          // Consider logging out the admin if session restoration fails critically
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation/profile update failed:', error);
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          team: userData.team,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      
      // First, delete the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        throw profileError;
      }

      // Then call edge function to remove the auth account
      const { data, error: funcError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (funcError || data?.error) {
        const errMsg = funcError?.message || data?.error || 'Failed to delete user';
        throw new Error(errMsg);
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User deletion failed:', error);
    }
  });
};