
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
      
      // Try to get all profiles without RLS restriction for admin
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        // If RLS blocks this, try a different approach
        if (error.code === 'PGRST116' || error.message.includes('RLS')) {
          console.log('Trying to fetch with current user context...');
          // For now, return empty array and we'll fix RLS policies
          return [];
        }
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
      
      // Use regular signUp instead of admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
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

      // The profile will be created automatically by the trigger
      // But we may need to update it with role and team
      if (authData.user.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: userData.role,
            team: userData.team || null,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't throw here as the user is created, just log the error
        }
      }

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
