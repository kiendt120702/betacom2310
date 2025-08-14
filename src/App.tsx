
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ThumbnailGallery from "./pages/ThumbnailGallery";
import AverageRatingPage from "./pages/AverageRatingPage";
import FastDeliveryTheoryPage from "./pages/FastDeliveryTheoryPage";
import FastDeliveryCalculationPage from "./pages/FastDeliveryCalculationPage";
import AdminPanel from "./pages/AdminPanel";
import Management from "./pages/Management";
import MyProfilePage from "./pages/MyProfilePage";
import TrainingContentPage from "./pages/TrainingContentPage";
import TrainingProcessPage from "./pages/TrainingProcessPage";
import AssignmentSubmissionPage from "./pages/AssignmentSubmissionPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import SeoKnowledgePage from "./pages/SeoKnowledgePage";
import SeoProductDescriptionPage from "./pages/SeoProductDescriptionPage";
import TacticChatbotPage from "./pages/TacticChatbotPage";
import TacticManagement from "./pages/TacticManagement";
import Gpt4oMiniPage from "./pages/Gpt4oMiniPage";
import ShopeeFeesPage from "./pages/ShopeeFeesPage";
import TeamManagement from "./pages/admin/TeamManagement";
import SalesReportPage from "./pages/SalesReportPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/thumbnail" element={<ThumbnailGallery />} />
                          <Route path="/average-rating" element={<AverageRatingPage />} />
                          <Route path="/fast-delivery/theory" element={<FastDeliveryTheoryPage />} />
                          <Route path="/fast-delivery/calculation" element={<FastDeliveryCalculationPage />} />
                          <Route path="/sales-report" element={<SalesReportPage />} />
                          <Route path="/admin" element={<AdminPanel />} />
                          <Route path="/management" element={<Management />} />
                          <Route path="/my-profile" element={<MyProfilePage />} />
                          <Route path="/training/:courseId" element={<TrainingContentPage />} />
                          <Route path="/training-process" element={<TrainingProcessPage />} />
                          <Route path="/assignment/:assignmentId" element={<AssignmentSubmissionPage />} />
                          <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
                          <Route path="/seo-knowledge" element={<SeoKnowledgePage />} />
                          <Route path="/seo-product-description" element={<SeoProductDescriptionPage />} />
                          <Route path="/tactic-chatbot" element={<TacticChatbotPage />} />
                          <Route path="/tactic-management" element={<TacticManagement />} />
                          <Route path="/gpt4o-mini" element={<Gpt4oMiniPage />} />
                          <Route path="/shopee-fees" element={<ShopeeFeesPage />} />
                          <Route path="/admin/teams" element={<TeamManagement />} />
                          <Route path="/coming-soon" element={<ComingSoonPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
