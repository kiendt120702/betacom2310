import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Home from '@/pages/Home';

const AuthRedirector: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Hiển thị một màn hình tải trong khi chờ xác định trạng thái đăng nhập
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Nếu đã đăng nhập, hiển thị trang Home
    return <Home />;
  } else {
    // Nếu chưa đăng nhập, chuyển hướng đến trang Auth (đăng nhập)
    return <Navigate to="/auth" replace />;
  }
};

export default AuthRedirector;