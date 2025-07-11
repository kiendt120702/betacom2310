import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  botType: "strategy" | "seo", // Removed "general"
  onTitleUpdate?: (title: string) => void
) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesTableKey = 
    botType === "strategy" ? "chat_messages" : 
    "seo_chat_messages"; // Simplified messagesTableKey
  
  const functionName = 
    botType === "strategy" ? "chat-strategy" : 
    "seo-chat"; // Simplified functionName

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

  // Load messages for the selected conversation
  const { data: conversationMessages = [] } = useQuery({
    queryKey: [`${botType}-messages`, conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
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
    enabled: !!conversationId,
  });

  // Update messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      setMessages(conversationMessages);
    } else {
      // Show welcome message for new conversation
      const welcomeMessage = {
        id: "welcome",
        type: "bot" as const,
        content: config.welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [conversationId, conversationMessages, config.welcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      setTimeout(scrollToBottom, 0);
      return newMessages;
    });
    setInputMessage("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setTimeout(scrollToBottom, 0);

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: userMessage.content,
          conversationId: conversationId,
        },
      });

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: stripMarkdown(data.response),
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const newMessages = [...prev, responseMessage];
        setTimeout(scrollToBottom, 0);
        return newMessages;
      });

      // Update conversation title if it's the first message
      if (onTitleUpdate && messages.length <= 1) {
        const title = userMessage.content.length > 50 
          ? userMessage.content.substring(0, 50) + "..."
          : userMessage.content;
        onTitleUpdate(title);
      }

    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setTimeout(scrollToBottom, 0);

      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
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
    isLoading,
    messagesEndRef,
    config,
    handleSendMessage,
    handleKeyPress,
  };
};