"use client";

import React, { useState, useEffect } from "react";
import { useNavigate }
from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight, Plus, Bot } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatLayoutProps {
  botType: "strategy" | "seo";
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ botType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const conversationsTableKey = botType === "strategy" ? "chat_conversations" : "seo_chat_conversations";
  const conversationsQueryKey = botType === "strategy" ? "strategy-conversations" : "seo-conversations";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from(conversationsTableKey)
        .insert({
          user_id: user.id,
          bot_type: botType === "strategy" ? "strategy" : undefined, // Only for strategy bot
          title: "Cuộc hội thoại mới",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [conversationsQueryKey] });
      setSelectedConversationId(data.id);
      if (isMobile) {
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
        .from(conversationsTableKey)
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [conversationsQueryKey] });
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
      
      <div className="flex-1 flex h-[calc(100vh-5rem)]">
        {/* Desktop Sidebar - Improved Design */}
        <div className={`hidden md:flex flex-col bg-white text-gray-900 h-full border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0`}>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
            {sidebarOpen && (
              <Button
                onClick={handleNewConversation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
                disabled={createConversation.isPending}
              >
                <Plus className="w-4 h-4" />
                {createConversation.isPending ? 'Đang tạo...' : 'Cuộc hội thoại mới'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              title={sidebarOpen ? "Thu gọn" : "Mở rộng"}
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          <ChatSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewConversation={handleNewConversation}
            botType={botType}
            sidebarOpen={sidebarOpen}
            className="flex-1"
          />
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 border-b border-gray-100">
                <SheetTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {botType === "strategy" ? "Tư vấn AI" : "SEO Shopee"}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-3 border-b border-gray-200">
                <Button
                  onClick={handleNewConversation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
                  disabled={createConversation.isPending}
                >
                  <Plus className="w-4 h-4" />
                  {createConversation.isPending ? 'Đang tạo...' : 'Cuộc hội thoại mới'}
                </Button>
              </div>
              <ChatSidebar
                selectedConversationId={selectedConversationId}
                onSelectConversation={(id) => {
                  setSelectedConversationId(id);
                  setIsMobileSidebarOpen(false);
                }}
                onNewConversation={handleNewConversation}
                botType={botType}
                sidebarOpen={true}
                className="flex-1"
              />
            </SheetContent>
          </Sheet>
        )}
        
        <ChatInterface
          conversationId={selectedConversationId}
          botType={botType}
          onTitleUpdate={handleTitleUpdate}
        />
      </div>
    </div>
  );
};

export default ChatLayout;