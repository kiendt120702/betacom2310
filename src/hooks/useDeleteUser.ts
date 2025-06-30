
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
