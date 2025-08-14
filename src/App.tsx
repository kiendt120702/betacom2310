import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/useAuth"; // Import AuthProvider

import { MainLayout } from "@/components/layouts/MainLayout";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import AdminPanel from "@/pages/AdminPanel";
import ThumbnailGallery from "@/pages/ThumbnailGallery";
import Management from "@/pages/Management";
import TrainingContentPage from "@/pages/TrainingContentPage";
import TrainingProcessPage from "@/pages/TrainingProcessPage";
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage";
import MyProfilePage from "@/pages/MyProfilePage";
import SeoKnowledgePage from "@/pages/SeoKnowledgePage";
import SeoChatbotPage from "@/pages/SeoChatbotPage";
import SeoProductDescriptionPage from "@/pages/SeoProductDescriptionPage";
import AverageRatingPage from "@/pages/AverageRatingPage";
import TacticManagement from "@/pages/TacticManagement";
import TacticChatbotPage from "@/pages/TacticChatbotPage";
import ShopeeFeesPage from "@/pages/ShopeeFeesPage";
import Gpt4oMiniPage from "@/pages/Gpt4oMiniPage";
import FastDeliveryTheoryPage from "@/pages/FastDeliveryTheoryPage";
import FastDeliveryCalculationPage from "@/pages/FastDeliveryCalculationPage";
import NotFound from "@/pages/NotFound";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";

const RevenueUploadPage = React.lazy(() => import("./pages/RevenueUploadPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider> {/* AuthProvider bọc toàn bộ Routes */}
            <div className="min-h-screen bg-background">
              <ErrorBoundary>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route index element={<Index />} />
                            <Route path="admin/*" element={<AdminPanel />} />
                            <Route path="thumbnails" element={<ThumbnailGallery />} />
                            <Route path="management" element={<Management />} />
                            <Route path="training/*" element={<TrainingContentPage />} />
                            <Route path="training-process" element={<TrainingProcessPage />} />
                            <Route path="assignment-submission/:assignmentId" element={<AssignmentSubmissionPage />} />
                            <Route path="my-profile" element={<MyProfilePage />} />
                            <Route path="seo-knowledge" element={<SeoKnowledgePage />} />
                            <Route path="seo-chatbot" element={<SeoChatbotPage />} />
                            <Route path="seo-product-description" element={<SeoProductDescriptionPage />} />
                            <Route path="average-rating" element={<AverageRatingPage />} />
                            <Route path="tactic-management" element={<TacticManagement />} />
                            <Route path="tactic-chatbot" element={<TacticChatbotPage />} />
                            <Route path="shopee-fees" element={<ShopeeFeesPage />} />
                            <Route path="gpt4o-mini" element={<Gpt4oMiniPage />} />
                            <Route path="/fast-delivery/theory" element={<FastDeliveryTheoryPage />} />
                            <Route path="/fast-delivery/calculation" element={<FastDeliveryCalculationPage />} />
                            <Route path="revenue-upload" element={<RevenueUploadPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </ErrorBoundary>
            </div>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;