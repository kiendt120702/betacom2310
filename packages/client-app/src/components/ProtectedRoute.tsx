import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useUserProfile } from "@shared/hooks/useUserProfile";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();

  // Hiển thị loading khi đang kiểm tra authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu không có user, chuyển hướng đến trang đăng nhập
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Hiển thị loading khi đang tải profile (chỉ khi có user)
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Nếu có lỗi khi tải profile hoặc không có profile, chuyển hướng đến trang đăng nhập
  if (profileError || !userProfile) {
    console.error("Profile loading error or no profile found:", profileError);
    return <Navigate to="/auth" replace />;
  }

  // Nếu đã đăng nhập và có hồ sơ đầy đủ, hiển thị các route/component con
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;