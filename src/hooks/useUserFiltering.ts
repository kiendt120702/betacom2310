
import { UserProfile } from './useUserProfile';

export const useUserFiltering = (
  users: UserProfile[] | undefined,
  searchTerm: string,
  currentUser: UserProfile | undefined
) => {
  if (!users) return [];

  let filteredUsers = users;

  // Filter by team if user is leader
  if (currentUser?.role === 'leader' && currentUser?.team) {
    filteredUsers = filteredUsers.filter(user => user.team === currentUser.team);
  }

  // Filter by search term
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return filteredUsers;
};
