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

  // RLS handles filtering for leaders, so no extra client-side filtering is needed.
  // An admin will see all users. A leader will only see users in their team.

  return filteredUsers;
};