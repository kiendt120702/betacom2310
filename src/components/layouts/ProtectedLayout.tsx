import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from '@/components/layouts/MainLayout';
import PageLoader from '@/components/PageLoader';
import { PageTracker } from '@/hooks/usePageTracking';
import { useUpdateSessionActivity } from '@/hooks/useLoginTracking';
import { useAuth } from '@/hooks/useAuth';

const ProtectedLayout = () => {
  const { user } = useAuth();
  const updateActivityMutation = useUpdateSessionActivity();

  useEffect(() => {
    const updateActivity = () => {
      if (user) {
        updateActivityMutation.mutate({ userId: user.id });
      }
    };

    // Update activity immediately on layout mount
    updateActivity();

    // Set up an interval to update activity periodically
    const intervalId = setInterval(updateActivity, 60 * 1000); // every 1 minute

    return () => clearInterval(intervalId);
  }, [user, updateActivityMutation]);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <PageTracker />
            <Outlet />
          </Suspense>
        </MainLayout>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;