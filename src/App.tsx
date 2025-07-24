
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import QuickProductPost from "./pages/QuickProductPost";
import StrategyManagement from "./pages/StrategyManagement";
import AverageRatingPage from "./pages/AverageRatingPage";
import BannerGallery from "./pages/BannerGallery";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import Auth from "./pages/Auth";
import Management from "./pages/Management";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="flex h-screen w-full">
                        <AppSidebar />
                        <div className="flex-1 overflow-auto">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/quick-product-post" element={<QuickProductPost />} />
                            <Route path="/strategy-management" element={<StrategyManagement />} />
                            <Route path="/average-rating" element={<AverageRatingPage />} />
                            <Route path="/banner-gallery" element={<BannerGallery />} />
                            <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
                            <Route path="/management" element={<Management />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                } />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
