
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2, Edit3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  botType: "strategy" | "seo";
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

  const tableKey = botType === "strategy" ? "chat_conversations" : "seo_chat_conversations";

  // Fetch conversations
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

  // Delete conversation mutation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from(tableKey)
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${botType}-conversations`] });
      toast({
        title: "Đã xóa",
        description: "Cuộc hội thoại đã được xóa thành công",
      });
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
    if (confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) {
      deleteConversation.mutate(conversationId);
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-700 flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
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
              <div className="text-gray-400 text-sm p-4 text-center">
                <div className="animate-pulse">Đang tải...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-gray-400 text-sm p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <div className="text-base mb-2">Chưa có cuộc hội thoại</div>
                <div className="text-xs opacity-70">Tạo cuộc hội thoại đầu tiên của bạn!</div>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedConversationId === conversation.id
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-5 h-5 flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate leading-5">
                        {truncateTitle(conversation.title || "Cuộc hội thoại mới")}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - only show on hover or when selected */}
                  <div className={`flex items-center gap-1 ${
                    selectedConversationId === conversation.id 
                      ? "opacity-100" 
                      : "opacity-0 group-hover:opacity-100"
                  } transition-opacity duration-200`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement rename functionality
                      }}
                      className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                      title="Đổi tên"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="p-1.5 rounded hover:bg-red-600 transition-colors"
                      title="Xóa cuộc hội thoại"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-center py-2 px-3 rounded-lg bg-gray-800 text-gray-300">
          {botType === "strategy" ? "🎯 Tư vấn chiến lược" : "🔍 Tư vấn SEO"}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
