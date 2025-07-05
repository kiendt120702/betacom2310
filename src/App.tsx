import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Home from "./pages/Home"; // Import the new Home page
import BannerGallery from "./pages/BannerGallery";
import Admin from "./pages/Admin";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import GeneralChatbotPage from "./pages/GeneralChatbotPage";
import QuickProductPost from "./pages/QuickProductPost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} /> {/* Set Home as the default route */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/thumbnail" element={<BannerGallery />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
            <Route path="/general-chatbot" element={<GeneralChatbotPage />} />
            <Route path="/quick-post" element={<QuickProductPost />} />
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unknown paths to Home */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;