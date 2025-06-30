import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";

const SeoChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
        .from("seo_chat_conversations")
        .insert({
          user_id: user.id,
          title: "Cuộc hội thoại mới",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seo-conversations"] });
      setSelectedConversationId(data.id);
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
        .from("seo_chat_conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-conversations"] });
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      {/* Đảm bảo container này chiếm hết chiều cao còn lại */}
      <div className="flex-1 flex h-[calc(100vh-5rem)]"> 
        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
          botType="seo"
        />
        
        <ChatInterface
          conversationId={selectedConversationId}
          botType="seo"
          onTitleUpdate={handleTitleUpdate}
          // Loại bỏ className và style cố định chiều cao/rộng ở đây
        />
      </div>
    </div>
  );
};

export default SeoChatbotPage;