
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'leader' | 'chuyên viên';
  team: 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev';
}

interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: 'admin' | 'leader' | 'chuyên viên';
  team?: 'Team Bình' | 'Team Nga' | 'Team Thơm' | 'Team Thanh' | 'Team Giang' | 'Team Quỳnh' | 'Team Dev';
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
        console.error('Error fetching users:', error);
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
      console.log('Creating user with data:', userData);

      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found');
      }

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
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Không thể tạo user');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          team: userData.team,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      const { error: sessionError } = await supabase.auth.setSession(currentSession.session);
      
      if (sessionError) {
        console.error('Session restore error:', sessionError);
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
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }

      const { data, error: funcError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (funcError || data?.error) {
        const errMsg = funcError?.message || data?.error || 'Failed to delete user';
        console.error('Error deleting user from auth:', errMsg);
        throw new Error(errMsg);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
