
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
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

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600"
        >
          <Plus className="w-4 h-4" />
          Cuộc hội thoại mới
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-gray-400 text-sm p-2">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-400 text-sm p-2">
              Chưa có cuộc hội thoại nào
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-gray-700"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="text-sm truncate">
                    {truncateTitle(conversation.title || "Cuộc hội thoại mới")}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-600 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        {botType === "strategy" ? "Tư vấn chiến lược" : "Tư vấn SEO"}
      </div>
    </div>
  );
};

export default ChatSidebar;
