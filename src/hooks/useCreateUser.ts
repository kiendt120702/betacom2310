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
            console.warn('User already registered in auth.users. Checking for missing profile...');
            
            // Try to get the existing user from auth.users
            const { data: existingAuthUser, error: getAuthUserError } = await supabase.auth.admin.getUserByEmail(userData.email);

            if (getAuthUserError || !existingAuthUser?.user) {
              console.error('Failed to retrieve existing auth user:', getAuthUserError);
              throw new Error(`Tài khoản đã tồn tại nhưng không thể truy xuất thông tin: ${getAuthUserError?.message || 'Lỗi không xác định'}`);
            }

            // Check if a profile exists for this user in public.profiles
            const { data: existingProfile, error: getProfileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', existingAuthUser.user.id)
              .single();

            if (getProfileError && getProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
              console.error('Error fetching existing profile:', getProfileError);
              throw new Error(`Lỗi khi kiểm tra hồ sơ người dùng: ${getProfileError.message}`);
            }

            if (existingProfile) {
              // User exists in both auth and profiles, so it's a genuine duplicate
              console.error('User already exists in both auth and profiles. Cannot create.');
              throw new Error('Tài khoản đã tồn tại trong hệ thống.');
            } else {
              // User exists in auth.users but not in public.profiles. Create the profile.
              console.log('User exists in auth.users but not in public.profiles. Creating profile...');
              
              const { error: insertProfileError } = await supabase
                .from('profiles')
                .insert({
                  id: existingAuthUser.user.id,
                  email: userData.email,
                  full_name: userData.full_name,
                  role: userData.role,
                  team: userData.team,
                });

              if (insertProfileError) {
                console.error('Error inserting profile for existing auth user:', insertProfileError);
                throw new Error(`Không thể tạo hồ sơ người dùng: ${insertProfileError.message}`);
              }

              // Optionally, update user_metadata in auth.users if it's not already set
              const { error: updateAuthUserError } = await supabase.auth.admin.updateUserById(
                existingAuthUser.user.id,
                {
                  data: {
                    full_name: userData.full_name,
                    role: userData.role,
                    team: userData.team,
                  }
                }
              );

              if (updateAuthUserError) {
                console.warn('Warning: Could not update auth user metadata:', updateAuthUserError);
              }

              console.log('Profile created for existing auth user.');
              return existingAuthUser.user; // Return the existing user
            }
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