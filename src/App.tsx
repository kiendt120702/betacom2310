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

// Lazy load components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const BannerGallery = React.lazy(() => import("./pages/BannerGallery"));
const SeoProductNamePage = React.lazy(() => import("./pages/SeoChatbotPage"));
const SeoProductDescriptionPage = React.lazy(() => import("./pages/SeoProductDescriptionPage"));
const Management = React.lazy(() => import("./pages/Management"));
const MyProfilePage = React.lazy(() => import("./pages/MyProfilePage"));
const TeamManagement = React.lazy(() => import("./pages/admin/TeamManagement"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AverageRatingPage = React.lazy(() => import("./pages/AverageRatingPage"));
const TacticManagement = React.lazy(() => import("./pages/TacticManagement"));
const ShopeeFeesPage = React.lazy(() => import("./pages/ShopeeFeesPage"));
const TacticChatbotPage = React.lazy(() => import("./pages/TacticChatbotPage"));
const TrainingProcessPage = React.lazy(() => import("./pages/TrainingProcessPage"));
const TrainingContentPage = React.lazy(() => import("./pages/TrainingContentPage"));
const AssignmentSubmissionPage = React.lazy(() => import("./pages/AssignmentSubmissionPage"));

// Environment-based QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < (import.meta.env.PROD ? 3 : 1);
        }
        return failureCount < (import.meta.env.PROD ? 3 : 1);
      },
      // More aggressive caching in production
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnMount: import.meta.env.DEV ? 'always' : false,
      // Network error handling
      networkMode: 'online',
    },
    mutations: {
      retry: import.meta.env.PROD ? 2 : 0, // More retries in production
      networkMode: 'online',
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
                          <Suspense fallback={<div>Loading...</div>}>
                            <Routes>
                            <Route path="/" element={<Index />} />
                            <Route
                              path="/thumbnail"
                              element={<BannerGallery />}
                            />
                            <Route
                              path="/seo-product-name"
                              element={<SeoProductNamePage />}
                            />
                            <Route
                              path="/seo-product-description"
                              element={<SeoProductDescriptionPage />}
                            />
                            <Route
                              path="/average-rating"
                              element={<AverageRatingPage />}
                            />
                            <Route
                              path="/tactic"
                              element={<TacticManagement />}
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
                            />
                            <Route
                              path="/tactic-chatbot"
                              element={<TacticChatbotPage />}
                            />
                            <Route
                              path="/training-process"
                              element={<TrainingProcessPage />}
                            />
                            <Route
                              path="/training-content"
                              element={<TrainingContentPage />}
                            />
                            <Route
                              path="/assignment-submission"
                              element={<AssignmentSubmissionPage />}
                            />
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