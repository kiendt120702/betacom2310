import { useUserProfile } from "./useUserProfile";
import { useRolePermissions, useUserPermissionOverrides } from "./usePermissions";
import { useMemo } from "react";

export const useEduShopeeAccess = () => {
  const { data: userProfile } = useUserProfile();
  const { data: rolePermissions = [], isLoading: roleLoading } = useRolePermissions(userProfile?.role || null);
  const { data: userOverrides = [], isLoading: overridesLoading } = useUserPermissionOverrides(userProfile?.id || null);

  // Calculate final user permissions (role permissions + user overrides)
  const userPermissions = useMemo(() => {
    if (!rolePermissions) return [];

    const grantOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'grant').map(o => o.permission_id));
    const denyOverrides = new Set(userOverrides?.filter(o => o.permission_type === 'deny').map(o => o.permission_id));

    // Start with role permissions
    const finalPermissions = new Set(rolePermissions);

    // Apply user overrides
    grantOverrides.forEach(id => finalPermissions.add(id));
    denyOverrides.forEach(id => finalPermissions.delete(id));

    return Array.from(finalPermissions);
  }, [rolePermissions, userOverrides]);

  // Check if user has access to Edu Shopee
  const hasAccess = useMemo(() => {
    if (!userProfile) return false;

    // Admin always has access
    if (userProfile.role === 'admin') return true;

    // Check for manage_edu_shopee permission
    if (userPermissions.includes('manage_edu_shopee')) return true;

    // Legacy check for backward compatibility
    if (['học việc/thử việc'].includes(userProfile.role)) return true;

    return false;
  }, [userProfile, userPermissions]);

  return {
    hasAccess,
    isLoading: !userProfile || roleLoading || overridesLoading,
    userProfile,
    userPermissions
  };
};