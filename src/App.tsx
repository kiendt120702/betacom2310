import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainLayout } from "@/components/layouts/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import { PageLoading } from "@/components/ui/page-loading";

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const BannerGallery = React.lazy(() => import("./pages/BannerGallery"));
const SeoProductNamePage = React.lazy(() => import("./pages/SeoChatbotPage"));
const SeoProductDescriptionPage = React.lazy(() => import("./pages/SeoProductDescriptionPage"));
const Management = React.lazy(() => import("./pages/Management"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const TeamManagement = React.lazy(() => import("./pages/admin/TeamManagement"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const GeneralDashboard = React.lazy(() => import("./pages/GeneralDashboard"));
const AverageRatingPage = React.lazy(() => import("./pages/AverageRatingPage"));
const StrategyManagement = React.lazy(() => import("./pages/StrategyManagement"));
const ShopeeFeesPage = React.lazy(() => import("./pages/ShopeeFeesPage"));
const StrategyChatbotPage = React.lazy(() => import("./pages/StrategyChatbotPage")); // New lazy import

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center space-y-6">
      {/* Loading Spinner */}
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      
      {/* Loading Text */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang tải...
        </p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
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
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <MainLayout>
                          <Suspense fallback={<PageLoading message="Đang tải trang..." />}>
                            <Routes>
                            <Route path="/" element={<GeneralDashboard />} />
                            <Route
                              path="/banners-landing"
                              element={<Index />}
                            />
                            <Route
                              path="/thumbnail"
                              element={<BannerGallery />}
                            />
                            <Route
                              path="/seo-product-name"
                              element={<SeoProductNamePage />}
                            />{" "}
                            {/* Updated route */}
                            <Route
                              path="/seo-product-description"
                              element={<SeoProductDescriptionPage />}
                            />{" "}
                            {/* New route */}
                            <Route
                              path="/average-rating"
                              element={<AverageRatingPage />}
                            />
                            <Route
                              path="/strategy"
                              element={<StrategyManagement />}
                            />
                            <Route
                              path="/management"
                              element={<Management />}
                            />
                            <Route
                              path="/my-profile"
                              element={<MyProfilePage />}
                            />
                            <Route
                              path="/admin/teams"
                              element={<TeamManagement />}
                            />
                            <Route
                              path="/shopee-fees"
                              element={<ShopeeFeesPage />}
                            />{" "}
                            {/* New route */}
                            <Route
                              path="/strategy-chatbot"
                              element={<StrategyChatbotPage />}
                            />{" "}
                            {/* New route for Strategy Chatbot */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </MainLayout>
                      </SidebarProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
