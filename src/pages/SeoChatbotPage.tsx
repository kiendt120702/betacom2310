import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } => "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { Menu } from 'lucide-react'; // Import Menu icon
import { Button } from '@/components/ui/button'; // Import Button

const SeoChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const isMobile = useIsMobile(); // Initialize useIsMobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar

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
      if (isMobile) { // Close sidebar on mobile after creating new conversation
        setIsMobileSidebarOpen(false);
      }
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

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobile) { // Close sidebar on mobile after selecting conversation
      setIsMobileSidebarOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      {/* Đảm bảo container này chiếm hết chiều cao còn lại */}
      <div className="flex-1 flex h-[calc(100vh-4rem)]"> 
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0 w-64 h-full">
          <ChatSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            botType="seo"
          />
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <ChatSidebar
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                botType="seo"
              />
            </SheetContent>
          </Sheet>
        )}
        
        <ChatInterface
          conversationId={selectedConversationId}
          botType="seo"
          onTitleUpdate={handleTitleUpdate}
        />
      </div>
    </div>
  );
};

export default SeoChatbotPage;