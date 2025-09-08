import { useUserProfile } from "./useUserProfile";
import { useMemo } from "react";

export const useEduShopeeAccess = () => {
  const { data: userProfile, isLoading } = useUserProfile();

  const hasAccess = useMemo(() => {
    // Only allow access for users with the 'học việc/thử việc' role
    return !!userProfile && userProfile.role === 'học việc/thử việc';
  }, [userProfile]);

  return {
    hasAccess,
    isLoading,
    userProfile,
    userPermissions: [] // Return empty array as detailed permissions are removed
  };
};