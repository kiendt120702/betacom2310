
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
  const gradientBg = botType === "strategy" 
    ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" 
    : "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900";
  const accentColor = botType === "strategy" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-emerald-600 hover:bg-emerald-500";

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
    <div className={`w-80 ${gradientBg} text-white flex flex-col h-full shadow-2xl border-r border-gray-700`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <Button
          onClick={onNewConversation}
          className={`w-full flex items-center gap-3 ${accentColor} text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl`}
        >
          <Plus className="w-5 h-5" />
          Cuộc hội thoại mới
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-3">
          {isLoading ? (
            <div className="text-gray-400 text-sm p-3 text-center">
              <div className="animate-pulse">Đang tải...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-400 text-sm p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div>Chưa có cuộc hội thoại nào</div>
              <div className="text-xs mt-1 opacity-75">Tạo cuộc hội thoại đầu tiên!</div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 hover:shadow-md ${
                  selectedConversationId === conversation.id
                    ? "bg-white/15 shadow-md border border-white/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${
                    botType === "strategy" ? "bg-indigo-500/20" : "bg-emerald-500/20"
                  } flex items-center justify-center flex-shrink-0`}>
                    <MessageCircle className={`w-4 h-4 ${
                      botType === "strategy" ? "text-indigo-400" : "text-emerald-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-white">
                      {truncateTitle(conversation.title || "Cuộc hội thoại mới")}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className={`text-xs text-center py-2 px-3 rounded-lg ${
          botType === "strategy" ? "bg-indigo-500/10 text-indigo-300" : "bg-emerald-500/10 text-emerald-300"
        }`}>
          {botType === "strategy" ? "🎯 Tư vấn chiến lược" : "🔍 Tư vấn SEO"}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
