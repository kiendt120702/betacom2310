
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { secureLog } from '@/lib/utils';

export const useManagementAuth = () => {
  const { user } = useAuth();
  const { data: userProfile, isLoading, isError, error } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [redirectInitiated, setRedirectInitiated] = useState(false);

  const activeTab = location.hash.replace('#', '');

  useEffect(() => {
    if (redirectInitiated) return;

    if (!user) {
      setRedirectInitiated(true);
      secureLog('User not authenticated, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    if (isError) {
      secureLog('Error loading user profile in Management page:', error);
      toast({
        title: "Lỗi tải hồ sơ",
        description: "Không thể tải thông tin hồ sơ người dùng. Vui lòng thử lại.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/auth');
      return;
    }

    // Determine initial tab based on user role if no hash is present
    if (!activeTab && userProfile) {
      const isAdmin = userProfile.role === 'admin';
      const isLeader = userProfile.role === 'leader';

      let defaultTab = 'my-profile'; // Default for chuyen vien
      if (isAdmin) defaultTab = 'my-profile'; // Admin defaults to My Profile
      else if (isLeader) defaultTab = 'users'; // Leader defaults to User Management
      
      navigate(`/management#${defaultTab}`, { replace: true });
      return;
    }

    // Security check: Redirect if user doesn't have access to Management page at all
    if (userProfile && !['admin', 'leader', 'chuyên viên'].includes(userProfile.role)) {
      secureLog('User role not authorized for management page:', userProfile.role);
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang management.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/thumbnail');
      return;
    }

    // Security check: Redirect if chuyen vien tries to access other tabs
    if (userProfile?.role === 'chuyên viên' && activeTab !== 'my-profile') {
      secureLog('Chuyên viên attempted to access unauthorized tab:', activeTab);
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn chỉ có quyền truy cập hồ sơ của mình.",
        variant: "destructive",
      });
      navigate('/management#my-profile', { replace: true });
    }

  }, [user, userProfile, navigate, toast, redirectInitiated, activeTab, isError, error]);

  return {
    userProfile,
    isLoading,
    activeTab,
  };
};
