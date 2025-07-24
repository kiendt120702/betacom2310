import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import { useChatConversation } from "@/hooks/useChatConversation";

interface ChatPageLayoutProps {
  botType: "strategy" | "seo";
}

const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({ botType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    selectedConversationId,
    handleNewConversation,
    handleTitleUpdate,
    handleSelectConversation,
  } = useChatConversation(botType);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-5rem)]"> 
      <div className="hidden md:flex flex-shrink-0 w-64">
        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          botType={botType}
        />
      </div>
      
      <ChatInterface
        conversationId={selectedConversationId}
        botType={botType}
        onTitleUpdate={handleTitleUpdate}
      />
    </div>
  );
};

export default ChatPageLayout;