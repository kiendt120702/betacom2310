import { UserProfile } from "./useUserProfile";

export const useUserPermissions = (currentUser: UserProfile | undefined) => {
  const isAdmin = currentUser?.role === "admin";
  const isLeader = currentUser?.role === "leader";
  const isChuyenVien = currentUser?.role === "chuyên viên";
  const isHocViec = currentUser?.role === "học việc/thử việc"; // New role check
  const isBooking = currentUser?.role === "booking";
  const canCreateUser = isAdmin || isLeader;
  const canEditManager = isAdmin;
  const canEditGoals = isAdmin || isLeader || isChuyenVien || currentUser?.role === "trưởng phòng";

  return {
    isAdmin,
    isLeader,
    isChuyenVien,
    isHocViec, // Export new role
    isBooking,
    canCreateUser,
    canEditManager,
    canEditGoals,
  };
};