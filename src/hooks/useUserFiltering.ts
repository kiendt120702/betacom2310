import { UserProfile } from './useUserProfile';

export const useUserFiltering = (
  users: UserProfile[] | undefined,
  searchTerm: string,
  currentUser: UserProfile | undefined
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

  // No need to filter by team for leaders here, as RLS should already handle that.
  // The `useUsers` query will only return users the current user is allowed to see.
  // If the RLS policy is correctly set up, a leader will only see users in their team
  // (and themselves) directly from the database.

  return filteredUsers;
};