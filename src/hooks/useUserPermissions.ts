import { UserProfile } from './useUserProfile';

export const useUserPermissions = (currentUser: UserProfile | undefined) => {
  const isAdmin = currentUser?.role === 'admin';
  const isLeader = currentUser?.role === 'leader';
  const canCreateUser = isAdmin || isLeader;

  return {
    isAdmin,
    isLeader,
    canCreateUser
  };
};