
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

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

  // Handle profile errors more gracefully to prevent logout loops
  if (profileError) {
    console.error("Profile loading error:", profileError);
    
    // Check if it's a profile loading error (not an auth error)
    if (profileError.message?.includes("Profile loading error") || 
        profileError.message?.includes("infinite recursion") ||
        profileError.message?.includes("policy")) {
      // Show error message but don't logout - user is authenticated
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải thông tin người dùng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Có lỗi xảy ra khi tải thông tin hồ sơ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }
    
    // For other errors, redirect to auth
    return <Navigate to="/auth" replace />;
  }
  
  // If no profile but user exists, show loading (profile might still be loading)
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập và có hồ sơ đầy đủ, hiển thị các route/component con
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
