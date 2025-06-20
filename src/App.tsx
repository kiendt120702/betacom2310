
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import BannerGallery from "./pages/BannerGallery";
import Admin from "./pages/Admin";
import ChatbotPage from "./pages/ChatbotPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/banners" element={<BannerGallery />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
