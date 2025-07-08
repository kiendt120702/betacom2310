
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/components/layouts/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BannerGallery from "./pages/BannerGallery";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import GeneralChatbotPage from "./pages/GeneralChatbotPage";
import QuickProductPost from "./pages/QuickProductPost";
import Management from "./pages/Management";
import MyProfilePage from "./pages/MyProfilePage";
import SeoKnowledgePage from "./pages/SeoKnowledgePage";
import TeamManagement from "./pages/admin/TeamManagement";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/thumbnail" element={<BannerGallery />} />
                      <Route path="/chatbot" element={<ChatbotPage />} />
                      <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
                      <Route path="/general-chatbot" element={<GeneralChatbotPage />} />
                      <Route path="/quick-post" element={<QuickProductPost />} />
                      <Route path="/management" element={<Management />} />
                      <Route path="/my-profile" element={<MyProfilePage />} />
                      <Route path="/seo-knowledge" element={<SeoKnowledgePage />} />
                      <Route path="/admin/teams" element={<TeamManagement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
