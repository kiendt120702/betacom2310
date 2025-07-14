import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { stripMarkdown } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export const useChatMessages = (
  conversationId: string | null,
  botType: "strategy" | "seo",
  onTitleUpdate?: (title: string) => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false); // Renamed isLoading to isSending for clarity
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesTableKey = 
    botType === "strategy" ? "chat_messages" : 
    "seo_chat_messages";
  
  const functionName = 
    botType === "strategy" ? "chat-strategy" : 
    "seo-chat";

  const botConfig = {
    strategy: {
      botColorClass: "bg-chat-strategy-main",
      userColorClass: "bg-chat-strategy-main",
      welcomeMessage: "Chào bạn! Vui lòng mô tả tình trạng shop hoặc hỏi về chiến lược Shopee để tôi tư vấn nhé!",
      placeholder: "Hỏi bất kì điều gì về chiến lược Shopee hoặc đưa ra tình trạng shop đang gặp phải... (Shift+Enter để xuống dòng)",
      loadingMessage: "Đang phân tích và tìm kiếm chiến lược phù hợp...",
    },
    seo: {
      botColorClass: "bg-chat-seo-main",
      userColorClass: "bg-chat-seo-main",
      welcomeMessage: "Chào bạn! Tôi là chuyên gia SEO Shopee. Hãy chia sẻ tên sản phẩm hoặc câu hỏi về SEO để tôi hỗ trợ bạn tối ưu hiệu quả nhé!",
      placeholder: "Hỏi về SEO Shopee, tên sản phẩm, mô tả... (Shift+Enter để xuống dòng)",
      loadingMessage: "Đang phân tích và tìm kiếm kiến thức SEO phù hợp...",
    },
  };

  const config = botConfig[botType];

  // Fetch messages for the selected conversation using React Query
  const { data: messages = [], isLoading: isFetchingMessages } = useQuery<ChatMessage[]>({
    queryKey: [`${botType}-messages`, conversationId],
    queryFn: async () => {
      if (!conversationId) {
        // If no conversation is selected, return a welcome message
        return [{
          id: "welcome",
          type: "bot" as const,
          content: config.welcomeMessage,
          timestamp: new Date(),
        }];
      }
      
      const { data, error } = await supabase
        .from(messagesTableKey)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      return data.map((msg: any) => ({
        id: msg.id,
        type: msg.role === "user" ? "user" as const : "bot" as const,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    setTimeout(scrollToBottom, 0);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const userMessageContent = inputMessage.trim();
    const userMessageId = Date.now().toString();
    const loadingMessageId = `loading_${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMessageId,
      type: "user",
      content: userMessageContent,
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    // Optimistically update the cache with user message and loading message
    queryClient.setQueryData<ChatMessage[]>(
      [`${botType}-messages`, conversationId],
      (oldMessages) => {
        const currentMessages = oldMessages || [];
        return [...currentMessages, userMessage, loadingMessage];
      }
    );

    setInputMessage("");
    setIsSending(true);
    setTimeout(scrollToBottom, 0);

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: userMessageContent,
          conversationId: conversationId,
        },
      });

      if (error) throw error;

      const botResponseContent = stripMarkdown(data.response);
      const botResponseMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: botResponseContent,
        timestamp: new Date(),
      };

      // Update the cache with the actual bot response
      queryClient.setQueryData<ChatMessage[]>(
        [`${botType}-messages`, conversationId],
        (oldMessages) => {
          const updatedMessages = (oldMessages || []).filter(
            (msg) => msg.id !== loadingMessageId
          );
          return [...updatedMessages, botResponseMessage];
        }
      );

      // Update conversation title if it's the first message
      if (onTitleUpdate && messages.length <= 1) {
        const title = userMessageContent.length > 50 
          ? userMessageContent.substring(0, 50) + "..."
          : userMessageContent;
        onTitleUpdate(title);
      }

    } catch (error: any) {
      // Revert optimistic update or show error message
      queryClient.setQueryData<ChatMessage[]>(
        [`${botType}-messages`, conversationId],
        (oldMessages) => {
          const updatedMessages = (oldMessages || []).filter(
            (msg) => msg.id !== loadingMessageId && msg.id !== userMessageId
          );
          return [...updatedMessages, {
            id: Date.now().toString(),
            type: "bot",
            content: "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
            timestamp: new Date(),
          }];
        }
      );

      toast({
        title: "Lỗi",
        description: error.message || "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Chatbot error:", error);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading: isSending || isFetchingMessages, // Combine loading states
    messagesEndRef,
    config,
    handleSendMessage,
    handleKeyPress,
  };
};