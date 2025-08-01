import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainLayout } from "@/components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for better performance and smaller initial bundle
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const BannerGallery = React.lazy(() => import("./pages/BannerGallery"));
const SeoProductNamePage = React.lazy(() => import("./pages/SeoChatbotPage"));
const SeoProductDescriptionPage = React.lazy(() => import("./pages/SeoProductDescriptionPage"));
const Management = React.lazy(() => import("./pages/Management"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const TeamManagement = React.lazy(() => import("./pages/admin/TeamManagement"));
const GeneralDashboard = React.lazy(() => import("./pages/GeneralDashboard"));
const AverageRatingPage = React.lazy(() => import("./pages/AverageRatingPage"));
const StrategyManagement = React.lazy(() => import("./pages/StrategyManagement"));
const ShopeeFeesPage = React.lazy(() => import("./pages/ShopeeFeesPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/auth" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                    <Auth />
                  </Suspense>
                } />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <MainLayout>
                          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                            <Routes>
                              <Route path="/" element={<GeneralDashboard />} />
                              <Route path="/banners-landing" element={<Index />} />
                              <Route path="/thumbnail" element={<BannerGallery />} />
                              <Route path="/seo-product-name" element={<SeoProductNamePage />} />
                              <Route path="/seo-product-description" element={<SeoProductDescriptionPage />} />
                              <Route path="/average-rating" element={<AverageRatingPage />} />
                              <Route path="/strategy" element={<StrategyManagement />} />
                              <Route path="/management" element={<Management />} />
                              <Route path="/my-profile" element={<MyProfilePage />} />
                              <Route path="/admin/teams" element={<TeamManagement />} />
                              <Route path="/shopee-fees" element={<ShopeeFeesPage />} />
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