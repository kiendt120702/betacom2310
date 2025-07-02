import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile'; // Import useUserProfile

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  // Hiển thị màn hình tải trong khi chờ xác định trạng thái đăng nhập hoặc tải hồ sơ người dùng
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu người dùng chưa đăng nhập (user là null) HOẶC đã đăng nhập nhưng không có hồ sơ (userProfile là null),
  // chuyển hướng đến trang đăng nhập.
  if (!user || !userProfile) {
    return <Navigate to="/auth" replace />;
  }

  // Nếu đã đăng nhập và có hồ sơ đầy đủ, hiển thị các route/component con
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;