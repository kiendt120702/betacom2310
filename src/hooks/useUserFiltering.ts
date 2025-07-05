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

  // Apply role-based filtering for display in the table
  if (currentUser) {
    if (currentUser.role === 'leader') {
      // A leader should only see themselves and 'chuyên viên' in their team
      filteredUsers = filteredUsers.filter(user => 
        user.id === currentUser.id || 
        (user.team_id === currentUser.team_id && user.role === 'chuyên viên')
      );
    } else if (currentUser.role === 'chuyên viên') {
      // A 'chuyên viên' should only see themselves
      filteredUsers = filteredUsers.filter(user => user.id === currentUser.id);
    }
    // Admin sees all users, no additional filtering needed here.
  }

  return filteredUsers;
};