
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  // Nếu người dùng chưa đăng nhập (user là null) HOẶC đã đăng nhập nhưng không có hồ sơ (userProfile là null),
  // chuyển hướng đến trang đăng nhập.
  if (!user || (!profileLoading && !userProfile)) {
    return <Navigate to="/auth" replace />;
  }

  // Nếu đã đăng nhập và có hồ sơ đầy đủ, hiển thị các route/component con
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
