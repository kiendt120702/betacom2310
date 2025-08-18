import { UserProfile } from "./useUserProfile";

export const useUserPermissions = (currentUser: UserProfile | undefined) => {
  const isAdmin = currentUser?.role === "admin";
  const isLeader = currentUser?.role === "leader";
  const isChuyenVien = currentUser?.role === "chuyên viên";
  const isHocViec = currentUser?.role === "học việc/thử việc"; // New role check
  const canCreateUser = isAdmin || isLeader;

  return {
    isAdmin,
    isLeader,
    isChuyenVien,
    isHocViec, // Export new role
    canCreateUser,
  };
};