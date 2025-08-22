import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from '@/components/layouts/MainLayout';
import PageLoader from '@/components/PageLoader';
import { PageTracker } from '@/hooks/usePageTracking';
import { UploadProvider } from '@/contexts/UploadContext';
import UploadQueue from '@/components/UploadQueue';

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <UploadProvider>
        <SidebarProvider>
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <PageTracker />
              <Outlet />
            </Suspense>
          </MainLayout>
        </SidebarProvider>
        <UploadQueue />
      </UploadProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;