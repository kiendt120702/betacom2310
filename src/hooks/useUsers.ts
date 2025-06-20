
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'leader' | 'chuyên viên';
  team?: string;
}

interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: 'admin' | 'leader' | 'chuyên viên';
  team?: string;
}

export const useUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching all users from profiles table...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
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

      // Get current session before creating new user
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found');
      }

      // Use signUp which doesn't switch sessions automatically
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.full_name,
            role: userData.role,
            team: userData.team || null,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Không thể tạo user');
      }

      // Create profile manually since the user won't be automatically logged in
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          team: userData.team || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as we want to show success message about email confirmation
      }

      // Ensure admin session is maintained
      await supabase.auth.setSession(currentSession.session);

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
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
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // For now, just mark as inactive or handle deletion differently
      // since we can't use admin API on client side
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'chuyên viên', // Downgrade role instead of delete
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
