import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserProfile } from './useUserProfile';
import { UserRole, TeamType } from '@/integrations/supabase/types'; // Import directly from types.ts
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole; // Still pass name for signup metadata
  team: TeamType; // Still pass name for signup metadata
}

interface UpdateUserData {
  id: string;
  full_name?: string;
  role_id?: string; // Now expects role_id (UUID)
  team_id?: string | null; // Now expects team_id (UUID)
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
        .select(`
          *,
          roles ( name ),
          teams ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Map the data to the UserProfile interface, extracting role and team names
      const usersData = data.map((profile: any) => ({
        ...profile,
        role: (profile.roles as { name: UserRole } | null)?.name || null,
        team: (profile.teams as { name: TeamType } | null)?.name || null,
      })) as UserProfile[];

      console.log('Fetched raw users from DB:', usersData);
      return usersData;
    },
    enabled: !!user,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // Initialize toast

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Creating user with data:', userData);

      // Store current session to restore later
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found');
      }

      console.log('Current admin session preserved');

      // Create new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: userData.full_name,
            role: userData.role, // Pass role name to metadata
            team: userData.team, // Pass team name to metadata
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

      console.log('New user created:', authData.user.id);

      // The profile record will be created automatically by the 'handle_new_user' trigger
      // which now correctly populates 'role_id' and 'team_id' from raw_user_meta_data.
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
      toast({
        title: "Thành công",
        description: "Tạo người dùng mới thành công",
      });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng mới",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // Initialize toast

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          role_id: userData.role_id, // Update role_id
          team_id: userData.team_id, // Update team_id
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
      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin người dùng.",
        variant: "destructive",
      });
      console.error('User update failed:', error);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // Initialize toast

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
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
      });
    },
    onError: (error) => {
      console.error('User deletion failed:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng.",
        variant: "destructive",
      });
    }
  });
};