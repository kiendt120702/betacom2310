"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { stripMarkdown } from '@/lib/utils'; // Added import

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  botType: "strategy" | "seo" | "general"; // Updated botType
  onTitleUpdate?: (title: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  botType,
  onTitleUpdate,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesTableKey = 
    botType === "strategy" ? "chat_messages" : 
    botType === "seo" ? "seo_chat_messages" : 
    "general_chat_messages"; // New table key for general bot
  
  const functionName = 
    botType === "strategy" ? "chat-strategy" : 
    botType === "seo" ? "seo-chat" : 
    "general-chat"; // New function name for general bot

  let botColorClass = "";
  let userColorClass = "";
  let welcomeMessageContent = "";
  let placeholderText = "";
  let loadingMessageText = "";

  switch (botType) {
    case "strategy":
      botColorClass = "bg-chat-strategy-main";
      userColorClass = "bg-chat-strategy-main";
      welcomeMessageContent = "Chào bạn! Vui lòng mô tả tình trạng shop hoặc hỏi về chiến lược Shopee để tôi tư vấn nhé!";
      placeholderText = "Hỏi bất kì điều gì về chiến lược Shopee hoặc đưa ra tình trạng shop đang gặp phải... (Shift+Enter để xuống dòng)";
      loadingMessageText = "Đang phân tích và tìm kiếm chiến lược phù hợp...";
      break;
    case "seo":
      botColorClass = "bg-chat-seo-main";
      userColorClass = "bg-chat-seo-main";
      welcomeMessageContent = "Chào bạn! Tôi là chuyên gia SEO Shopee. Hãy chia sẻ tên sản phẩm hoặc câu hỏi về SEO để tôi hỗ trợ bạn tối ưu hiệu quả nhé!";
      placeholderText = "Hỏi về SEO Shopee, tên sản phẩm, mô tả... (Shift+Enter để xuống dòng)";
      loadingMessageText = "Đang phân tích và tìm kiếm kiến thức SEO phù hợp...";
      break;
    case "general":
      botColorClass = "bg-chat-general-main";
      userColorClass = "bg-chat-general-main";
      welcomeMessageContent = "Chào bạn! Tôi là trợ lý AI hỏi đáp mọi thứ. Bạn có câu hỏi nào không?";
      placeholderText = "Hỏi bất kì điều gì... (Shift+Enter để xuống dòng)";
      loadingMessageText = "Đang tìm kiếm câu trả lời...";
      break;
  }

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
        content: welcomeMessageContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    // Do NOT scroll to bottom here, only when new messages are added by user/bot
  }, [conversationId, conversationMessages, botType, welcomeMessageContent]);

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
      // Scroll immediately after user sends message
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
    setTimeout(scrollToBottom, 0); // Scroll to loading message

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
        content: stripMarkdown(data.response), // Use stripMarkdown here
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const newMessages = [...prev, responseMessage];
        setTimeout(scrollToBottom, 0); // Scroll after bot response
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
      setTimeout(scrollToBottom, 0); // Scroll after error message

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

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white p-4">
        <Card className="max-w-md w-full bg-white text-gray-900 border border-gray-100 rounded-2xl p-6 shadow-lg text-center">
          <div className={`w-16 h-16 ${botColorClass} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {botType === "strategy" ? "Chào bạn! Tôi là chuyên gia tư vấn chiến lược Shopee." : 
             botType === "seo" ? "Chào bạn! Tôi là chuyên gia SEO Shopee." :
             "Chào bạn! Tôi là trợ lý AI hỏi đáp mọi thứ."}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {botType === "strategy" 
              ? "Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận tư vấn chuyên nghiệp từ AI."
              : botType === "seo"
              ? "Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận hỗ trợ tối ưu SEO hiệu quả."
              : "Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận hỗ trợ từ trợ lý AI hỏi đáp mọi thứ."
            }
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-white`} style={{ width: 'calc(100vw - 256px)', height: 'calc(100vh - 80px)' }}>
      {/* Messages Area - Fixed height with scroll */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                {message.type === "bot" && (
                  <div className={`w-8 h-8 rounded-full ${botColorClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                    message.type === "user"
                      ? `${userColorClass} text-white`
                      : "bg-white text-gray-900 border border-gray-100"
                  }`}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-600 text-sm">
                        {loadingMessageText}
                      </span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </div>
                  )}
                  <div
                    className={`text-xs mt-2 ${
                      message.type === "user"
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div >

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4 flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText}
            disabled={isLoading}
            className="flex-1 min-h-[44px] h-11 max-h-[100px] resize-none border-gray-200 focus:border-gray-300 rounded-xl shadow-sm"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`self-end ${botColorClass} hover:${botColorClass}/90 shadow-sm rounded-xl px-5 h-11`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div >
  );
};

export default ChatInterface;