import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';
import { Database } from '@/integrations/supabase/types';
import { CreateUserData, UpdateUserData } from './types/userTypes'; // Import from types/userTypes

export const useUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching users for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'deleted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched raw users from DB:', data); // Added console.log here
      return data as UserProfile[];
    },
    enabled: !!user,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Creating user with data:', userData);

      // Store current session to restore later
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found');
      }

      console.log('Current admin session preserved');

      // Prepare user metadata for signup
      const userMetaData: { full_name: string; role: string; team?: string } = {
        full_name: userData.full_name,
        role: userData.role,
      };
      if (userData.team) { // Only add team if it's not null
        userMetaData.team = userData.team;
      }

      // Create new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: userMetaData // Pass full_name, role, team via data
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Không thể tạo user');
      }

      console.log('New user created:', authData.user.id);

      // The profile record will be created automatically by the 'handle_new_user' trigger
      // which now correctly populates 'role' and 'team' from raw_user_meta_data.
      // No manual insert into 'profiles' is needed here.

      // Immediately restore admin session to prevent logout
      const { error: sessionError } = await supabase.auth.setSession(currentSession.session);
      
      if (sessionError) {
        console.error('Session restore error:', sessionError);
      } else {
        console.log('Admin session restored successfully');
      }

      return authData.user;
    },
    onSuccess: () => {
      console.log('User creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
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
          team: userData.team, // This now correctly handles null
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        console.error('Error updating user:', error);
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
      console.log('Deleting user with ID:', userId);
      
      // First, delete the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }

      console.log('Profile deleted successfully');

      // Then call edge function to remove the auth account
      const { data, error: funcError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (funcError || data?.error) {
        const errMsg = funcError?.message || data?.error || 'Failed to delete user';
        console.error('Error deleting user from auth:', errMsg);
        throw new Error(errMsg);
      }

      console.log('Auth user deleted successfully');
    },
    onSuccess: () => {
      console.log('User deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User deletion failed:', error);
    }
  });
};