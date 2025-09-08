import { useUserProfile } from "./useUserProfile";
import { useMemo } from "react";

export const useEduShopeeAccess = () => {
  const { data: userProfile, isLoading } = useUserProfile();

  const hasAccess = useMemo(() => {
    // Allow access for any authenticated user with a profile that is not 'deleted'
    return !!userProfile && userProfile.role !== 'deleted';
  }, [userProfile]);

  return {
    hasAccess,
    isLoading,
    userProfile,
    userPermissions: [] // Return empty array as detailed permissions are removed
  };
};