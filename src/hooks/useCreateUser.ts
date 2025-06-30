import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateUserData } from './types/userTypes';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Attempting to create user with data:', userData);

      // Store current session to restore later
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (!currentSession?.session) {
        throw new Error('No active session found. Admin session required to create users.');
      }

      console.log('Current admin session preserved.');

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
            console.warn('User already registered in auth.users. Attempting to manage profile via Edge Function...');
            
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
              console.error('Error from manage-user-profile Edge Function:', errMsg);
              throw new Error(`Không thể quản lý hồ sơ người dùng: ${errMsg}`);
            }

            console.log('Profile managed successfully for existing auth user via Edge Function.');
            // We don't get the user object back directly, but the profile is handled.
            // For simplicity, we can return a success indicator or refetch users.
            return { success: true, message: 'Profile managed for existing user' };

          } else {
            // Re-throw other authentication errors
            console.error('Other authentication error during signup:', authError);
            throw authError;
          }
        }

        if (!authData.user) {
          throw new Error('Không thể tạo người dùng mới.');
        }

        console.log('New user created via signup:', authData.user.id);
        // Profile should be created by trigger for new signups
        return authData.user;

      } finally {
        // Always restore admin session to prevent logout
        const { error: sessionRestoreError } = await supabase.auth.setSession(currentSession.session);
        if (sessionRestoreError) {
          console.error('Error restoring admin session:', sessionRestoreError);
          // Consider logging out the admin if session restoration fails critically
        } else {
          console.log('Admin session restored successfully.');
        }
      }
    },
    onSuccess: () => {
      console.log('User creation/profile update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation/profile update failed:', error);
    }
  });
};