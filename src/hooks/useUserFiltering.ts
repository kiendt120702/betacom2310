import { UserProfile } from './useUserProfile';

export const useUserFiltering = (
  users: UserProfile[] | undefined,
  searchTerm: string,
  currentUser: UserProfile | undefined // Keep currentUser for potential future role-based filtering
) => {
  if (!users) return [];

  let filteredUsers = users;

  // Filter by search term
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Removed team-based filtering as the 'team' column is being removed.
  // RLS policies on the database will handle what users can see based on their role.

  return filteredUsers;
};