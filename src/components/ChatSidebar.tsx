import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2, HelpCircle, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  botType: "seo"; // Chỉ còn botType "seo"
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  botType
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tableKey = "seo_chat_conversations"; // Chỉ còn bảng seo_chat_conversations

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: [`${botType}-conversations`, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from(tableKey)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });

  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from(tableKey)
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
      return conversationId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: [`${botType}-conversations`] });
      toast({
        title: "Đã xóa",
        description: "Cuộc hội thoại đã được xóa thành công",
      });
      if (selectedConversationId === deletedId) {
        onNewConversation();
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa cuộc hội thoại",
        variant: "destructive",
      });
      console.error("Delete conversation error:", error);
    },
  });

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation.mutate(conversationId);
  };

  const getBotIcon = (type: "seo") => { // Chỉ còn botType "seo"
    switch (type) {
      case "seo": return <Search className="w-5 h-5 text-chat-seo-main" />;
      default: return <MessageCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-64 bg-background text-foreground flex flex-col h-full border-r border-border flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cuộc hội thoại mới
        </Button>
      </div>

      {/* Conversations List with Custom Scrollbar */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="text-muted-foreground text-sm p-4 text-center">
                <div className="animate-pulse">Đang tải...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-muted-foreground text-sm p-6 text-center">
                {getBotIcon(botType)}
                <div className="text-base mb-2 text-foreground">Chưa có cuộc hội thoại</div>
                <div className="text-xs opacity-70">Tạo cuộc hội thoại đầu tiên của bạn!</div>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                    selectedConversationId === conversation.id
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-5 h-5 flex-shrink-0">
                      {getBotIcon(botType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-5 overflow-x-auto whitespace-nowrap">
                        {conversation.title || "Cuộc hội thoại mới"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - only show on hover or when selected */}
                  <div className={cn(
                    "flex items-center gap-1 transition-opacity duration-200",
                    selectedConversationId === conversation.id 
                      ? "opacity-100" 
                      : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                      title="Xóa cuộc hội thoại"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatSidebar;