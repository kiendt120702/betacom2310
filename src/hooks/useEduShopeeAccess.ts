import { useUserProfile } from "./useUserProfile";
import { useRolePermissions, useUserPermissionOverrides } from "./usePermissions";
import { useMemo } from "react";

export const useEduShopeeAccess = () => {
  const { data: userProfile } = useUserProfile();
  const { data: rolePermissions = [], isLoading: roleLoading, error: roleError } = useRolePermissions(userProfile?.role || null);
  const { data: userOverrides = [], isLoading: overridesLoading, error: overridesError } = useUserPermissionOverrides(userProfile?.id || null);

  // Log errors for debugging
  if (roleError) {
    console.error("🚨 Role permissions error:", roleError);
  }
  if (overridesError) {
    console.error("🚨 User overrides error:", overridesError);
  }

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

    console.log("🔍 Checking Edu Shopee access for:", userProfile.full_name, "Role:", userProfile.role);

    // Admin always has access
    if (userProfile.role === 'admin') {
      console.log("✅ Access granted - Admin role");
      return true;
    }

    // Check for manage_edu_shopee permission
    if (userPermissions.includes('manage_edu_shopee')) {
      console.log("✅ Access granted - Has manage_edu_shopee permission");
      return true;
    }

    // Legacy check for backward compatibility
    if (['học việc/thử việc'].includes(userProfile.role)) {
      console.log("✅ Access granted - Legacy role support");
      return true;
    }

    console.log("❌ Access denied - No valid permissions or roles");
    console.log("User permissions:", userPermissions);
    return false;
  }, [userProfile, userPermissions]);

  return {
    hasAccess,
    isLoading: !userProfile || roleLoading || overridesLoading,
    userProfile,
    userPermissions
  };
};