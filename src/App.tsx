
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layouts/MainLayout";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ThumbnailGallery from "@/pages/ThumbnailGallery";
import AdminPanel from "@/pages/AdminPanel";
import Management from "@/pages/Management";
import NotFound from "@/pages/NotFound";
import TacticManagement from "@/pages/TacticManagement";
import SeoChatbotPage from "@/pages/SeoChatbotPage";
import TacticChatbotPage from "@/pages/TacticChatbotPage";
import SeoKnowledgePage from "@/pages/SeoKnowledgePage";
import SeoProductDescriptionPage from "@/pages/SeoProductDescriptionPage";
import TrainingContentPage from "@/pages/TrainingContentPage";
import TrainingProcessPage from "@/pages/TrainingProcessPage";
import MyProfilePage from "@/pages/MyProfilePage";
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage";
import AverageRatingPage from "@/pages/AverageRatingPage";
import FastDeliveryCalculationPage from "@/pages/FastDeliveryCalculationPage";
import FastDeliveryTheoryPage from "@/pages/FastDeliveryTheoryPage";
import ShopeeFeesPage from "@/pages/ShopeeFeesPage";
import Gpt4oMiniPage from "@/pages/Gpt4oMiniPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import ConsolidatedReportPage from "@/pages/ConsolidatedReportPage";
import RevenueStatisticsPage from "@/pages/RevenueStatisticsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/thumbnails" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ThumbnailGallery />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminPanel />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Management />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/tactics" element={
                <ProtectedRoute>
                  <MainLayout>
                    <TacticManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/seo-chatbot" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SeoChatbotPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/tactic-chatbot" element={
                <ProtectedRoute>
                  <MainLayout>
                    <TacticChatbotPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/seo-knowledge" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SeoKnowledgePage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/seo-product-description" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SeoProductDescriptionPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/training-content/:courseId" element={
                <ProtectedRoute>
                  <TrainingContentPage />
                </ProtectedRoute>
              } />
              <Route path="/training-process" element={
                <ProtectedRoute>
                  <MainLayout>
                    <TrainingProcessPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/assignment-submission" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AssignmentSubmissionPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/average-rating" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AverageRatingPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/fast-delivery-calculation" element={
                <ProtectedRoute>
                  <MainLayout>
                    <FastDeliveryCalculationPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/fast-delivery-theory" element={
                <ProtectedRoute>
                  <MainLayout>
                    <FastDeliveryTheoryPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/shopee-fees" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ShopeeFeesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/gpt4o-mini" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Gpt4oMiniPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/consolidated-report" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ConsolidatedReportPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/revenue-statistics" element={
                <ProtectedRoute>
                  <MainLayout>
                    <RevenueStatisticsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/coming-soon" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ComingSoonPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
