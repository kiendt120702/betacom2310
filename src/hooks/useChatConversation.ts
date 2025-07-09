
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useChatConversation = (botType: "strategy" | "seo" | "general") => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const tableKey = 
    botType === "strategy" ? "chat_conversations" : 
    botType === "seo" ? "seo_chat_conversations" : 
    "general_chat_conversations";

  const queryKey = `${botType}-conversations`;

  const createConversation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const conversationData = botType === "strategy" 
        ? {
            user_id: user.id,
            bot_type: "strategy",
            title: "Cuộc hội thoại mới",
          }
        : {
            user_id: user.id,
            title: botType === "seo" ? "Cuộc hội thoại mới" : "Cuộc hội thoại chung",
          };

      const { data, error } = await supabase
        .from(tableKey)
        .insert(conversationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
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

  const updateConversationTitle = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from(tableKey)
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
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
  };

  return {
    selectedConversationId,
    handleNewConversation,
    handleTitleUpdate,
    handleSelectConversation,
    isCreating: createConversation.isPending,
  };
};
