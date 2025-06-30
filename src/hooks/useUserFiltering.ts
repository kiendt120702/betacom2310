import { UserProfile } from './useUserProfile';

export const useUserFiltering = (
  users: UserProfile[] | undefined,
  searchTerm: string,
  currentUser: UserProfile | undefined
) => {
  if (!users) return [];

  console.log('useUserFiltering - received users (before filter):', users); // Added console.log here
  console.log('useUserFiltering - currentUser:', currentUser); // Added console.log here

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

  console.log('useUserFiltering - after all filters, returned users:', filteredUsers); // Added console.log here
  return filteredUsers;
};