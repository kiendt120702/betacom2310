import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Management from "./pages/Management";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import GeneralChatbotPage from "./pages/GeneralChatbotPage";
import QuickProductPost from "./pages/QuickProductPost";
import MyProfilePage from "./pages/MyProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index"; // Re-add Index page
import BannerGallery from "./pages/BannerGallery"; // Re-add BannerGallery page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/thumbnail" element={<Index />} /> {/* Re-add Thumbnail route */}
              <Route path="/banner-gallery" element={<BannerGallery />} /> {/* Re-add BannerGallery route */}
              <Route path="/management" element={<Management />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
              <Route path="/general-chatbot" element={<GeneralChatbotPage />} />
              <Route path="/quick-post" element={<QuickProductPost />} />
              <Route path="/my-profile" element={<MyProfilePage />} />
            </Route>
            {/* Redirect any unmatched paths to the home page (which is now protected) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;