"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ChatMessageItem from "./ChatMessageItem";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  botType: "strategy" | "seo";
  onTitleUpdate?: (title: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  botType,
  onTitleUpdate,
  className,
  style
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesTableKey = botType === "strategy" ? "chat_messages" : "seo_chat_messages";
  const functionName = botType === "strategy" ? "chat-strategy" : "seo-chat";
  const botColor = botType === "strategy" ? "bg-blue-600" : "bg-green-600";
  const hoverColor = botType === "strategy" ? "hover:bg-blue-700" : "hover:bg-green-700";

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
        content: botType === "strategy" 
          ? "Chào bạn! Vui lòng mô tả tình trạng shop hoặc hỏi về chiến lược Shopee để tôi tư vấn nhé!"
          : "Chào bạn! Tôi là chuyên gia SEO Shopee. Hãy chia sẻ tên sản phẩm hoặc câu hỏi về SEO để tôi hỗ trợ bạn tối ưu hiệu quả nhé!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    // Scroll to bottom when messages are initially loaded or conversation changes
    setTimeout(scrollToBottom, 0);
  }, [conversationId, conversationMessages, botType]);

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
        content: data.response,
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
      <div className={cn("flex-1 flex flex-col p-4", className)} style={style}>
        <Card className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white text-gray-900 border border-gray-100 rounded-2xl p-6 shadow-lg text-center justify-center items-center">
          <div className={cn(`w-16 h-16 ${botColor} rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg`)}>
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {botType === "strategy" ? "Chào bạn! Tôi là chuyên gia tư vấn chiến lược Shopee." : "Chào bạn! Tôi là chuyên gia SEO Shopee."}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {botType === "strategy" 
              ? "Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận tư vấn chuyên nghiệp từ AI."
              : "Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận hỗ trợ tối ưu SEO hiệu quả."
            }
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col p-4", className)} style={style}>
      <Card className="flex-1 flex flex-col max-w-4xl w-full mx-auto shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl max-h-[calc(100vh-112px)]"> {/* Adjusted max-h calculation */}
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area - Fixed height with scroll */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessageItem key={message.id} message={message} botType={botType} />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t bg-white/80 backdrop-blur-sm p-4 flex-shrink-0">
            <div className="flex gap-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  botType === "strategy"
                    ? "Hỏi bất kì điều gì về chiến lược Shopee hoặc đưa ra tình trạng shop đang gặp phải... (Shift+Enter để xuống dòng)"
                    : "Hỏi về SEO Shopee, tên sản phẩm, mô tả... (Shift+Enter để xuống dòng)"
                }
                disabled={isLoading}
                className="flex-1 min-h-[44px] h-11 max-h-[100px] resize-none border-gray-200 focus:border-gray-300 rounded-xl shadow-sm"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={cn(`self-end ${botColor} ${hoverColor} shadow-sm rounded-xl px-5 h-11`)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;