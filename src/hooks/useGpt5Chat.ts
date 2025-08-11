
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

// Database response type with string role
interface DatabaseMessage {
  id: string;
  conversation_id: string;
  role: string;
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
      try {
        const { data, error } = await supabase
          .from("gpt5_mini_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
    enabled: !!user,
  });
};

// Hook to get messages for a specific conversation
export const useMessages = (conversationId: string | null) => {
  return useQuery<Message[]>({
    queryKey: ["gpt5-messages", conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];
      try {
        const { data, error } = await supabase
          .from("gpt5_mini_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        
        // Convert database messages to typed messages
        return (data || []).map((msg: DatabaseMessage): Message => ({
          ...msg,
          role: msg.role as "user" | "assistant"
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
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
      try {
        const { data, error } = await supabase
          .from("gpt5_mini_conversations")
          .insert({ user_id: user.id, title })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gpt5-conversations", user?.id] });
    },
    onError: (error: any) => {
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
      try {
        const { data, error } = await supabase
          .from("gpt5_mini_messages")
          .insert(newMessage)
          .select()
          .single();
        if (error) throw error;
        
        // Convert database response to typed message
        const dbMessage = data as DatabaseMessage;
        return {
          ...dbMessage,
          role: dbMessage.role as "user" | "assistant"
        };
      } catch (error) {
        console.error("Error adding message:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gpt5-messages", data.conversation_id] });
    },
    onError: (error: any) => {
      toast.error("Lỗi gửi tin nhắn", { description: error.message });
    },
  });
};

// Hook to delete a conversation
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      try {
        // First delete all messages in the conversation
        const { error: messagesError } = await supabase
          .from("gpt5_mini_messages")
          .delete()
          .eq("conversation_id", conversationId);
        
        if (messagesError) throw messagesError;

        // Then delete the conversation
        const { error: conversationError } = await supabase
          .from("gpt5_mini_conversations")
          .delete()
          .eq("id", conversationId)
          .eq("user_id", user.id);
        
        if (conversationError) throw conversationError;
      } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gpt5-conversations", user?.id] });
      toast.success("Đã xóa cuộc trò chuyện");
    },
    onError: (error: any) => {
      toast.error("Lỗi xóa cuộc trò chuyện", { description: error.message });
    },
  });
};
