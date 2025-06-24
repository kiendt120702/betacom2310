
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BannerGallery from "./pages/BannerGallery";
import ChatbotPage from "./pages/ChatbotPage";
import SeoChatbotPage from "./pages/SeoChatbotPage";
import ProductBulkManager from "./pages/ProductBulkManager";
import Admin from "./pages/Admin";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/banners" element={<BannerGallery />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/seo-chatbot" element={<SeoChatbotPage />} />
            <Route path="/product-manager" element={<ProductBulkManager />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
