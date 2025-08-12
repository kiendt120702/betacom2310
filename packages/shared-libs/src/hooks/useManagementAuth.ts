import { useEffect, useState } from "react";
import { useUserProfile } from "./useUserProfile";
import { secureLog } from "../lib/utils";

export const useManagementAuth = () => {
  const { data: user, isLoading } = useUserProfile();
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLevel, setAccessLevel] = useState<
    "none" | "viewer" | "editor" | "admin"
  >("none");

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      secureLog("Management access denied: No user session");
      setHasAccess(false);
      setAccessLevel("none");
      return;
    }

    // Enhanced role-based access control
    const role = user.role;

    if (role === "admin") {
      setHasAccess(true);
      setAccessLevel("admin");
      secureLog("Management access granted: Admin level");
    } else if (role === "leader") {
      setHasAccess(true);
      setAccessLevel("editor");
      secureLog("Management access granted: Editor level");
    } else if (role === "chuyên viên") {
      setHasAccess(true);
      setAccessLevel("viewer");
      secureLog("Management access granted: Viewer level");
    } else {
      setHasAccess(false);
      setAccessLevel("none");
      secureLog("Management access denied: Insufficient permissions", { role });
    }
  }, [user, isLoading]);

  // Enhanced permission checks
  const canViewUsers =
    hasAccess && (accessLevel === "admin" || accessLevel === "editor");
  const canEditUsers = hasAccess && accessLevel === "admin";
  const canDeleteUsers = hasAccess && accessLevel === "admin";
  const canManageTeams = hasAccess && accessLevel === "admin";
  const canViewReports =
    hasAccess && (accessLevel === "admin" || accessLevel === "editor");
  const canExportData =
    hasAccess && (accessLevel === "admin" || accessLevel === "editor");

  // Session validation
  const validateSession = () => {
    if (!user) {
      secureLog("Session validation failed: No user");
      return false;
    }

    // Check if user session is still valid
    const sessionAge = Date.now() - new Date(user.created_at).getTime();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxSessionAge) {
      secureLog("Session validation failed: Session expired");
      return false;
    }

    return true;
  };

  return {
    user,
    hasAccess,
    accessLevel,
    isLoading,
    canViewUsers,
    canEditUsers,
    canDeleteUsers,
    canManageTeams,
    canViewReports,
    canExportData,
    validateSession,
  };
};