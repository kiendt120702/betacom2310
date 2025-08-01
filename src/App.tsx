import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainLayout } from "@/components/layouts/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BannerGallery from "./pages/BannerGallery";
import SeoProductNamePage from "./pages/SeoChatbotPage"; // Renamed import
import SeoProductDescriptionPage from "./pages/SeoProductDescriptionPage"; // New import
import Management from "./pages/Management";
import MyProfilePage from "./pages/MyProfilePage";
import TeamManagement from "./pages/admin/TeamManagement";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import GeneralDashboard from "./pages/GeneralDashboard";
import AverageRatingPage from "./pages/AverageRatingPage";
import StrategyManagement from "./pages/StrategyManagement";
import ShopeeFeesPage from "./pages/ShopeeFeesPage"; // New import

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
                      <SidebarProvider>
                        <MainLayout>
                          <Routes>
                            <Route path="/" element={<GeneralDashboard />} />
                            <Route
                              path="/banners-landing"
                              element={<Index />}
                            />
                            <Route
                              path="/thumbnail"
                              element={<BannerGallery />}
                            />
                            <Route
                              path="/seo-product-name"
                              element={<SeoProductNamePage />}
                            />{" "}
                            {/* Updated route */}
                            <Route
                              path="/seo-product-description"
                              element={<SeoProductDescriptionPage />}
                            />{" "}
                            {/* New route */}
                            <Route
                              path="/average-rating"
                              element={<AverageRatingPage />}
                            />
                            <Route
                              path="/strategy"
                              element={<StrategyManagement />}
                            />
                            <Route
                              path="/management"
                              element={<Management />}
                            />
                            <Route
                              path="/my-profile"
                              element={<MyProfilePage />}
                            />
                            <Route
                              path="/admin/teams"
                              element={<TeamManagement />}
                            />
                            <Route
                              path="/shopee-fees"
                              element={<ShopeeFeesPage />}
                            />{" "}
                            {/* New route */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </MainLayout>
                      </SidebarProvider>
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
