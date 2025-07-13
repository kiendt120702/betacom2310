import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";

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
        <div className="mb-6">
          {/* Removed the specific text content as requested */}
        </div>
        <ChatInterface conversationId={null} botType="seo" />
      </div>
    </div>
  );
};

export default SeoChatbotPage;