import { UserProfile } from './useUserProfile';

export const useUserFiltering = (
  users: UserProfile[] | undefined,
  searchTerm: string,
  currentUser: UserProfile | undefined,
  selectedRole: string, // New parameter for role filter
  selectedTeam: string // New parameter for team filter
) => {
  if (!users) return [];

  let filteredUsers = users;

  // Apply role-based filtering for display in the table (who the current user can see)
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

  // Apply search term filter
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply selected role filter
  if (selectedRole !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
  }

  // Apply selected team filter
  if (selectedTeam !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.team_id === selectedTeam);
  }

  return filteredUsers;
};