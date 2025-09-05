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
import EduRouteGuard from "./components/layouts/EduRouteGuard"; // Import EduRouteGuard
import FeedbackButton from "./components/FeedbackButton"; // Import FeedbackButton
import AdminRouteGuard from "./components/layouts/AdminRouteGuard"; // Import AdminRouteGuard
import TrainingAdminRouteGuard from "./components/layouts/TrainingAdminRouteGuard"; // Import new guard
import DashboardRouteGuard from "./components/layouts/DashboardRouteGuard"; // New import
import EduShopeeRouteGuard from "./components/layouts/EduShopeeRouteGuard"; // New import

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const ThumbnailGallery = React.lazy(() => import("./pages/ThumbnailGallery"));
const SeoProductDescriptionPage = React.lazy(
  () => import("./pages/SeoProductDescriptionPage"),
);
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const TeamManagement = React.lazy(
  () => import("./pages/admin/TeamManagement"),
);
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AverageRatingPage = React.lazy(
  () => import("./pages/AverageRatingPage"),
);
const TrainingContentPage = React.lazy(
  () => import("./pages/TrainingContentPage"),
);
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const FastDeliveryPage = React.lazy(
  () => import("./pages/FastDeliveryPage"),
);
const ComingSoonPage = React.lazy(() => import("./pages/ComingSoonPage"));
const LeaderPersonnelManagement = React.lazy(
  () => import("./pages/LeaderPersonnelManagement"),
);
const ComprehensiveReportsPage = React.lazy(
  () => import("./pages/ComprehensiveReportsPage"),
);
const ShopManagementPage = React.lazy(
  () => import("./pages/ShopManagementPage"),
);
const SalesDashboardPage = React.lazy(() => import("./pages/SalesDashboardPage"));
const GoalSettingPage = React.lazy(() => import("./pages/GoalSettingPage")); // Import new page
const DailySalesReportPage = React.lazy(
  () => import("./pages/DailySalesReportPage"),
);
const GeneralTrainingPage = React.lazy(
  () => import("./pages/GeneralTrainingPage"),
);
const LearningProgressPage = React.lazy(() => import("./pages/LearningProgressPage"));
const TrainingManagementPage = React.lazy(() => import("./pages/TrainingManagementPage")); // Import new page

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
      placeholderData: (previousData) => previousData, // Keep previous data while loading
    },
    mutations: {
      retry: 2,
      networkMode: "online",
    },
  },
});

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
                      <Route
                        path="/seo-product-description"
                        element={<SeoProductDescriptionPage />}
                      />
                      <Route
                        path="/average-rating"
                        element={<AverageRatingPage />}
                      />
                      <Route path="/my-profile" element={<MyProfilePage />} />
                      <Route
                        path="/admin/teams"
                        element={<TeamManagement />}
                      />
                      <Route
                        path="/training-content"
                        element={
                          <EduShopeeRouteGuard>
                            <TrainingContentPage />
                          </EduShopeeRouteGuard>
                        }
                      />
                      <Route
                        path="/general-training"
                        element={
                          <EduRouteGuard>
                            <GeneralTrainingPage />
                          </EduRouteGuard>
                        }
                      />
                      <Route
                        path="/fast-delivery"
                        element={<FastDeliveryPage />}
                      />
                      <Route
                        path="/leader-personnel"
                        element={<LeaderPersonnelManagement />}
                      />
                      <Route
                        path="/comprehensive-reports"
                        element={<ComprehensiveReportsPage />}
                      />
                      <Route
                        path="/shop-management"
                        element={<ShopManagementPage />}
                      />
                      <Route
                        path="/sales-dashboard"
                        element={
                          <DashboardRouteGuard>
                            <Suspense fallback={<PageLoader />}>
                              <SalesDashboardPage />
                            </Suspense>
                          </DashboardRouteGuard>
                        }
                      />
                      <Route
                        path="/goal-setting"
                        element={<GoalSettingPage />}
                      />
                      <Route
                        path="/daily-sales-report"
                        element={
                          <AdminRouteGuard>
                            <DailySalesReportPage />
                          </AdminRouteGuard>
                        }
                      />
                      <Route
                        path="/learning-progress"
                        element={<LearningProgressPage />}
                      />
                      <Route
                        path="/training-management"
                        element={
                          <TrainingAdminRouteGuard>
                            <TrainingManagementPage />
                          </TrainingAdminRouteGuard>
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
                </BrowserRouter>
                <FeedbackButton /> {/* Add FeedbackButton here */}
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;