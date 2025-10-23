import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import PageLoader from "./components/PageLoader"; // Import PageLoader
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import DashboardRouteGuard from "./components/layouts/DashboardRouteGuard";

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const ThumbnailGallery = React.lazy(() => import("./pages/ThumbnailGallery"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const TeamManagement = React.lazy(
  () => import("./pages/admin/TeamManagement"),
);
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const LeaderPersonnelManagement = React.lazy(
  () => import("./pages/LeaderPersonnelManagement"),
);
const SalesDashboardPage = React.lazy(() => import("./pages/SalesDashboardPage"));

// Lazy load TikTok pages
const TiktokComprehensiveReportsPage = React.lazy(() => import("./pages/TiktokComprehensiveReportsPage"));
const TiktokGoalSettingPage = React.lazy(() => import("./pages/TiktokGoalSettingPage"));
const TiktokSalesDashboard = React.lazy(() => import("./pages/TiktokSalesDashboard"));

// Create QueryClient with optimized configuration for faster loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer in memory
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          "status" in error &&
          typeof error.status === "number"
        ) {
          return error.status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false, // Prevent refetch on network reconnect
      networkMode: "online",
      placeholderData: (previousData: unknown) => previousData, // Keep previous data while loading
    },
    mutations: {
      retry: 2,
      networkMode: "online",
    },
  },
});

const AnimatedRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminPanel />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/thumbnail" element={<ThumbnailGallery />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/admin/teams" element={<TeamManagement />} />
        <Route
          path="/leader-personnel"
          element={<LeaderPersonnelManagement />}
        />
        <Route
          path="/shopee-sales-dashboard"
          element={
            <DashboardRouteGuard>
              <Suspense fallback={<PageLoader />}>
                <SalesDashboardPage />
              </Suspense>
            </DashboardRouteGuard>
          }
        />
        {/* TikTok Routes */}
        <Route
          path="/tiktok-comprehensive-reports"
          element={<TiktokComprehensiveReportsPage />}
        />
        <Route path="/tiktok-goal-setting" element={<TiktokGoalSettingPage />} />
        <Route
          path="/tiktok-sales-dashboard"
          element={
            <DashboardRouteGuard>
              <Suspense fallback={<PageLoader />}>
                <TiktokSalesDashboard />
              </Suspense>
            </DashboardRouteGuard>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary showDetails={true}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnimatedRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
