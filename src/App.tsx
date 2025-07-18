import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layouts/MainLayout";
import Index from "./pages/Index"; // This is the old Index (banner slideshow)
import Auth from "./pages/Auth";
import BannerGallery from "./pages/BannerGallery";
import StrategyChatbotPage from "./pages/StrategyChatbotPage"; // Updated import
import SeoChatbotPage from "./pages/SeoChatbotPage";
import QuickProductPost from "./pages/QuickProductPost";
import Management from "./pages/Management";
import MyProfilePage from "./pages/MyProfilePage";
import TeamManagement from "./pages/admin/TeamManagement";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import GeneralDashboard from "./pages/GeneralDashboard"; // Import the new GeneralDashboard
import AverageRatingPage from "./pages/AverageRatingPage"; // Import the new AverageRatingPage
import StrategyHub from "./pages/StrategyHub"; // Import the new StrategyHub

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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
                          <Route path="/" element={<GeneralDashboard />} /> {/* New Home Page */}
                          {/* Removed the /home route */}
                          <Route path="/banners-landing" element={<Index />} /> {/* Old Index page moved */}
                          <Route path="/thumbnail" element={<BannerGallery />} />
                          <Route path="/strategy-chatbot" element={<StrategyChatbotPage />} /> {/* Updated path */}
                          <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
                          <Route path="/quick-post" element={<QuickProductPost />} />
                          <Route path="/average-rating" element={<AverageRatingPage />} /> {/* New route */}
                          <Route path="/strategy-hub" element={<StrategyHub />} /> {/* New Strategy Hub route */}
                          <Route path="/management" element={<Management />} />
                          <Route path="/my-profile" element={<MyProfilePage />} />
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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;