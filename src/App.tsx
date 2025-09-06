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
import PageLoader from "./components/PageLoader";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import FeedbackButton from "./components/FeedbackButton";
import PermissionGuard from "./components/PermissionGuard";

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const ThumbnailGallery = React.lazy(() => import("./pages/ThumbnailGallery"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
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
const GoalSettingPage = React.lazy(() => import("./pages/GoalSettingPage"));
const DailySalesReportPage = React.lazy(
  () => import("./pages/DailySalesReportPage"),
);
const GeneralTrainingPage = React.lazy(
  () => import("./pages/GeneralTrainingPage"),
);
const LearningProgressPage = React.lazy(() => import("./pages/LearningProgressPage"));
const TrainingManagementPage = React.lazy(() => import("./pages/admin/TrainingManagementPage"));

// Lazy load TikTok pages
const TiktokComprehensiveReportsPage = React.lazy(() => import("./pages/TiktokComprehensiveReportsPage"));
const TiktokDailySalesReportPage = React.lazy(() => import("./pages/TiktokDailySalesReportPage"));
const TiktokGoalSettingPage = React.lazy(() => import("./pages/TiktokGoalSettingPage"));
const TiktokShopManagementPage = React.lazy(() => import("./pages/TiktokShopManagementPage"));
const TiktokSalesDashboardPage = React.lazy(() => import("./pages/TiktokSalesDashboardPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
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
      refetchOnReconnect: false,
      networkMode: "online",
      placeholderData: (previousData) => previousData,
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
                            <PermissionGuard permissionName="access_admin_panel">
                              <AdminPanel />
                            </PermissionGuard>
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />

                    <Route element={<ProtectedLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/thumbnail" element={<PermissionGuard permissionName="view_thumbnails"><ThumbnailGallery /></PermissionGuard>} />
                      <Route path="/average-rating" element={<PermissionGuard permissionName="access_rating_calculator"><AverageRatingPage /></PermissionGuard>} />
                      <Route path="/my-profile" element={<MyProfilePage />} />
                      <Route
                        path="/shopee-education"
                        element={<PermissionGuard permissionName="access_edu_shopee"><TrainingContentPage /></PermissionGuard>}
                      />
                      <Route
                        path="/general-training"
                        element={<GeneralTrainingPage />}
                      />
                      <Route
                        path="/fast-delivery"
                        element={<PermissionGuard permissionName="access_fast_delivery_tool"><FastDeliveryPage /></PermissionGuard>}
                      />
                      <Route
                        path="/leader-personnel"
                        element={<PermissionGuard permissionName="access_admin_panel"><LeaderPersonnelManagement /></PermissionGuard>}
                      />
                      <Route
                        path="/shopee-comprehensive-reports"
                        element={<PermissionGuard permissionName="access_shopee_reports"><ComprehensiveReportsPage /></PermissionGuard>}
                      />
                      <Route
                        path="/shopee-shop-management"
                        element={<PermissionGuard permissionName="access_shopee_reports"><ShopManagementPage /></PermissionGuard>}
                      />
                      <Route
                        path="/shopee-sales-dashboard"
                        element={<PermissionGuard permissionName="access_shopee_reports"><Suspense fallback={<PageLoader />}><SalesDashboardPage /></Suspense></PermissionGuard>}
                      />
                      <Route
                        path="/shopee-goal-setting"
                        element={<PermissionGuard permissionName="access_shopee_reports"><GoalSettingPage /></PermissionGuard>}
                      />
                      <Route
                        path="/shopee-daily-sales-report"
                        element={<PermissionGuard permissionName="access_shopee_reports"><DailySalesReportPage /></PermissionGuard>}
                      />
                      <Route
                        path="/learning-progress"
                        element={<LearningProgressPage />}
                      />
                      <Route
                        path="/training-management"
                        element={<PermissionGuard permissionName="access_admin_panel"><TrainingManagementPage /></PermissionGuard>}
                      />
                      {/* TikTok Routes */}
                      <Route
                        path="/tiktok-comprehensive-reports"
                        element={<PermissionGuard permissionName="access_tiktok_reports"><TiktokComprehensiveReportsPage /></PermissionGuard>}
                      />
                      <Route
                        path="/tiktok-daily-sales-report"
                        element={<PermissionGuard permissionName="access_tiktok_reports"><TiktokDailySalesReportPage /></PermissionGuard>}
                      />
                      <Route
                        path="/tiktok-goal-setting"
                        element={<PermissionGuard permissionName="access_tiktok_reports"><TiktokGoalSettingPage /></PermissionGuard>}
                      />
                      <Route
                        path="/tiktok-shop-management"
                        element={<PermissionGuard permissionName="access_tiktok_reports"><TiktokShopManagementPage /></PermissionGuard>}
                      />
                      <Route
                        path="/tiktok-sales-dashboard"
                        element={<PermissionGuard permissionName="access_tiktok_reports"><Suspense fallback={<PageLoader />}><TiktokSalesDashboardPage /></Suspense></PermissionGuard>}
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
                <FeedbackButton />
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;