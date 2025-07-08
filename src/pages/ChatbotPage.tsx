import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
// Removed useIsMobile, Sheet, SheetContent, SheetTrigger, Menu, Button imports

const ChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  // Removed isMobile and isMobileSidebarOpen states

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          bot_type: "strategy",
          title: "Cuộc hội thoại mới",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["strategy-conversations"] });
      setSelectedConversationId(data.id);
      // Removed mobile sidebar close logic
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc hội thoại mới",
        variant: "destructive",
      });
      console.error("Create conversation error:", error);
    },
  });

  // Update conversation title mutation
  const updateConversationTitle = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("chat_conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategy-conversations"] });
    },
  });

  const handleNewConversation = () => {
    createConversation.mutate();
  };

  const handleTitleUpdate = (title: string) => {
    if (selectedConversationId) {
      updateConversationTitle.mutate({ id: selectedConversationId, title });
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Removed mobile sidebar close logic
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <div className="flex-1 flex h-[calc(100vh-5rem)]"> 
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0 w-64">
          <ChatSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            botType="strategy"
          />
        </div>

        {/* Removed Mobile Sidebar */}
        
        {/* Main Chat Interface */}
        <ChatInterface
          conversationId={selectedConversationId}
          botType="strategy"
          onTitleUpdate={handleTitleUpdate}
        />
      </div>
    </div>
  );
};

export default ChatbotPage;