import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import BannerGallery from "./pages/BannerGallery";
import Admin from "./pages/Admin";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import GeneralChatbotPage from "./pages/GeneralChatbotPage";
import QuickProductPost from "./pages/QuickProductPost";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            {/* Protected Routes - Wrapped by ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route path="/banners" element={<BannerGallery />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
              <Route path="/general-chatbot" element={<GeneralChatbotPage />} />
              <Route path="/quick-post" element={<QuickProductPost />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;