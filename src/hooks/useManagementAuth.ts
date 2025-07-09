
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

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
      navigate('/auth');
      return;
    }
    
    if (isError) {
      console.error("Error loading user profile in Management page:", error);
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
      if (isAdmin) defaultTab = 'dashboard'; // Admin defaults to Dashboard
      else if (isLeader) defaultTab = 'users'; // Leader defaults to User Management
      
      navigate(`/management#${defaultTab}`, { replace: true });
      return;
    }

    // Redirect if user doesn't have access to Management page at all
    if (userProfile && userProfile.role !== 'admin' && userProfile.role !== 'leader' && userProfile.role !== 'chuyên viên') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang management.",
        variant: "destructive",
      });
      setRedirectInitiated(true);
      navigate('/thumbnail');
      return;
    }

    // Redirect if chuyen vien tries to access other tabs
    if (userProfile?.role === 'chuyên viên' && activeTab !== 'my-profile') {
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
