import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Hook to get all conversations for the current user
export const useConversations = () => {
  const { user } = useAuth();
  return useQuery<Conversation[]>({
    queryKey: ["gpt5-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("gpt5_mini_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });
};

// Hook to get messages for a specific conversation
export const useMessages = (conversationId: string | null) => {
  return useQuery<Message[]>({
    queryKey: ["gpt5-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("gpt5_mini_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
};

// Hook to create a new conversation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (title: string): Promise<Conversation> => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("gpt5_mini_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gpt5-conversations", user?.id] });
    },
    onError: (error) => {
      toast.error("Lỗi tạo cuộc trò chuyện", { description: error.message });
    },
  });
};

// Hook to add a message to a conversation
export const useAddMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMessage: {
      conversation_id: string;
      role: "user" | "assistant";
      content: string;
    }): Promise<Message> => {
      const { data, error } = await supabase
        .from("gpt5_mini_messages")
        .insert(newMessage)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gpt5-messages", data.conversation_id] });
    },
    onError: (error) => {
      toast.error("Lỗi gửi tin nhắn", { description: error.message });
    },
  });
};