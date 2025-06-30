import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Import cn for conditional class names

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void; // Keep this for internal use if needed, but layout handles the main button
  botType: "strategy" | "seo";
  sidebarOpen: boolean; // New prop to control sidebar state
  className?: string; // ADDED THIS LINE
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
  botType,
  sidebarOpen,
  className // ADDED THIS LINE
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tableKey = botType === "strategy" ? "chat_conversations" : "seo_chat_conversations";
  const queryKey = botType === "strategy" ? "strategy-conversations" : "seo-conversations";

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: [queryKey, user?.id],
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
      queryClient.invalidateQueries({ queryKey: [queryKey] });
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
    },
  });

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation.mutate(conversationId);
  };

  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <ScrollArea className={cn("flex-1 overflow-hidden", className)}>
      <div className="p-2 space-y-1 flex flex-col h-full"> {/* Added flex flex-col h-full here */}
        {isLoading ? (
          <div className="text-gray-500 text-sm p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Đang tải...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-500 text-sm p-6 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <div className="text-base mb-2">Chưa có cuộc hội thoại</div>
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
                  ? "bg-blue-100 text-blue-800 font-semibold shadow-sm"
                  : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                !sidebarOpen && "justify-center" // Center content when sidebar is closed
              )}
              title={!sidebarOpen ? conversation.title || "Cuộc hội thoại mới" : undefined}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <MessageCircle className={cn("w-5 h-5", selectedConversationId === conversation.id ? "text-blue-600" : "text-gray-500")} />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate leading-5">
                      {truncateTitle(conversation.title || "Cuộc hội thoại mới")}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons - only show on hover or when selected */}
              {sidebarOpen && (
                <div className={cn(
                  "flex items-center gap-1",
                  selectedConversationId === conversation.id 
                    ? "opacity-100" 
                    : "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-200"
                )}>
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="p-1.5 rounded hover:bg-red-100 transition-colors"
                    title="Xóa cuộc hội thoại"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatSidebar;