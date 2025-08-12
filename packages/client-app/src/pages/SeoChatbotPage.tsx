import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useEffect } from "react";
import SeoProductForm from "@/components/seo/SeoProductForm";

const SeoChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <SeoProductForm />
      </div>
    </div>
  );
};

export default SeoChatbotPage;