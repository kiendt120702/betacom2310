import { useUserProfile } from "./useUserProfile";
import { useMemo } from "react";

export const useEduShopeeAccess = () => {
  const { data: userProfile, isLoading } = useUserProfile();

  const hasAccess = useMemo(() => {
    // Only allow access for users with the 'admin' role
    return !!userProfile && userProfile.role === 'admin';
  }, [userProfile]);

  return {
    hasAccess,
    isLoading,
    userProfile,
    userPermissions: [] // Return empty array as detailed permissions are removed
  };
};