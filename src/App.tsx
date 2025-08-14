import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"

import { MainLayout } from "@/components/layouts/MainLayout"; // Changed to default import
import Auth from "@/pages/Auth"; // Changed to default import
import Index from "@/pages/Index"; // Changed to default import
import AdminPanel from "@/pages/AdminPanel"; // Changed to default import
import ThumbnailGallery from "@/pages/ThumbnailGallery"; // Changed to default import
import Management from "@/pages/Management"; // Changed to default import
import TrainingContentPage from "@/pages/TrainingContentPage"; // Changed to default import
import TrainingProcessPage from "@/pages/TrainingProcessPage"; // Changed to default import
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage"; // Changed to default import
import MyProfilePage from "@/pages/MyProfilePage"; // Changed to default import
import SeoKnowledgePage from "@/pages/SeoKnowledgePage"; // Changed to default import
import SeoChatbotPage from "@/pages/SeoChatbotPage"; // Changed to default import
import SeoProductDescriptionPage from "@/pages/SeoProductDescriptionPage"; // Changed to default import
import AverageRatingPage from "@/pages/AverageRatingPage"; // Changed to default import
import TacticManagement from "@/pages/TacticManagement"; // Changed to default import
import TacticChatbotPage from "@/pages/TacticChatbotPage"; // Changed to default import
import ShopeeFeesPage from "@/pages/ShopeeFeesPage"; // Changed to default import
import Gpt4oMiniPage from "@/pages/Gpt4oMiniPage"; // Changed to default import
import FastDeliveryTheoryPage from "@/pages/FastDeliveryTheoryPage"; // Changed to default import
import FastDeliveryCalculationPage from "@/pages/FastDeliveryCalculationPage"; // Changed to default import
import NotFound from "@/pages/NotFound"; // Changed to default import
import LoadingSpinner from "@/components/LoadingSpinner"; // Changed to default import
import ErrorBoundary from "@/components/ErrorBoundary"; // Changed to default import
import ProtectedRoute from "@/components/ProtectedRoute"; // Import ProtectedRoute

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
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;