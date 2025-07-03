import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';
import { Database } from '@/integrations/supabase/types';
// Removed: import { ApiError } from '@supabase/supabase-js'; 

type TeamType = Database['public']['Enums']['team_type'];
type UserRole = Database['public']['Enums']['user_role'];

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  team: TeamType | null;
}

interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: UserRole;
  team?: TeamType | null;
}

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
      console.log('Creating user via Edge Function with data:', userData);

      // Call the new Edge Function to create the user
      const { data, error: funcError } = await supabase.functions.invoke('create-user-admin', {
        body: {
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          role: userData.role,
          team: userData.team,
        }
      });

      if (funcError) {
        let errorMessage = 'Failed to create user via Edge Function.';
        // The error from invoke is a standard Error object, but its message might contain JSON from the Edge Function
        try {
          const errorBody = JSON.parse(funcError.message);
          if (errorBody.error) {
            errorMessage = errorBody.error;
          } else {
            errorMessage = funcError.message; // Fallback if no specific 'error' field
          }
        } catch (e) {
          errorMessage = funcError.message; // If parsing fails, use the raw message
        }
        console.error('Error from create-user-admin Edge Function:', errorMessage);
        throw new Error(errorMessage);
      }

      if (data?.error) { // This handles cases where the function returns a 200 but with an 'error' field in the body
        console.error('Error from create-user-admin Edge Function (data.error):', data.error);
        throw new Error(data.error);
      }

      console.log('User created successfully via Edge Function:', data.userId);
      return data.userId;
    },
    onSuccess: () => {
      console.log('User creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation failed (mutation onError):', error);
      // The error object here is already an Error instance with the message formatted by mutationFn
      // The toast is handled in CreateUserDialog.tsx, which will use error.message
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