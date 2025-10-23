import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from '@/components/layouts/MainLayout';
import PageLoader from '@/components/PageLoader';

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </MainLayout>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
