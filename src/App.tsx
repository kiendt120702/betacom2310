import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import BannerGallery from "./pages/BannerGallery";
import Management from "./pages/Management";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import GeneralChatbotPage from "./pages/GeneralChatbotPage";
import SeoProductTitleChatbotPage from "./pages/SeoProductTitleChatbotPage"; // New import
import QuickProductPost from "./pages/QuickProductPost";
import MyProfilePage from "./pages/MyProfilePage";

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
            <Route path="/thumbnail" element={<BannerGallery />} />
            <Route path="/management" element={<Management />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
            <Route path="/general-chatbot" element={<GeneralChatbotPage />} />
            <Route path="/seo-product-title-chatbot" element={<SeoProductTitleChatbotPage />} /> {/* New route */}
            <Route path="/quick-post" element={<QuickProductPost />} />
            <Route path="/my-profile" element={<MyProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;