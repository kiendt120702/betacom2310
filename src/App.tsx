
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Suspense, lazy } from 'react';
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const BannerGallery = lazy(() => import("./pages/BannerGallery"));
const AverageRatingPage = lazy(() => import("./pages/AverageRatingPage"));
const TacticManagement = lazy(() => import("./pages/TacticManagement"));
const ShopeeFeesPage = lazy(() => import("./pages/ShopeeFeesPage"));
const SeoChatbotPage = lazy(() => import("./pages/SeoChatbotPage"));
const SeoProductDescriptionPage = lazy(() => import("./pages/SeoProductDescriptionPage"));
const TacticChatbotPage = lazy(() => import("./pages/TacticChatbotPage"));
const Management = lazy(() => import("./pages/Management"));
const TeamManagement = lazy(() => import("./pages/admin/TeamManagement"));
const SeoKnowledgePage = lazy(() => import("./pages/SeoKnowledgePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// EDU pages
const TrainingProcessPage = lazy(() => import('./pages/TrainingProcessPage'));
const TrainingContentPage = lazy(() => import('./pages/TrainingContentPage'));
const AssignmentSubmissionPage = lazy(() => import('./pages/AssignmentSubmissionPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <MainLayout>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/thumbnail" element={<BannerGallery />} />
                        <Route path="/average-rating" element={<AverageRatingPage />} />
                        <Route path="/tactic" element={<TacticManagement />} />
                        <Route path="/shopee-fees" element={<ShopeeFeesPage />} />
                        <Route path="/seo-product-name" element={<SeoChatbotPage />} />
                        <Route path="/seo-product-description" element={<SeoProductDescriptionPage />} />
                        <Route path="/tactic-chatbot" element={<TacticChatbotPage />} />
                        <Route path="/management" element={<Management />} />
                        
                        <Route path="/training-process" element={<TrainingProcessPage />} />
                        <Route path="/training-content" element={<TrainingContentPage />} />
                        <Route path="/assignment-submission" element={<AssignmentSubmissionPage />} />
                        
                        <Route path="/admin/teams" element={<TeamManagement />} />
                        <Route path="/admin/seo-knowledge" element={<SeoKnowledgePage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </MainLayout>
                </ErrorBoundary>
              </ProtectedRoute>
            } />
          </Routes>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
