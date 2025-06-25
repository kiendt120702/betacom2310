
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: any[];
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Chào bạn! Vui lòng mô tả tình trạng shop hoặc hỏi về chiến lược Shopee để tôi tư vấn nhé!",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create conversation when component mounts
  useEffect(() => {
    const createConversation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: user.id,
            bot_type: "strategy",
            title: "Tư vấn chiến lược Shopee",
          })
          .select()
          .single();

        if (error) throw error;
        setConversationId(data.id);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    };

    createConversation();
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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

    try {
      const { data, error } = await supabase.functions.invoke("chat-strategy", {
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
        context: data.context,
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content:
          "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <Card className="mb-4 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Tư vấn chiến lược Shopee
          </CardTitle>
          <p className="text-sm text-gray-600">
            Hệ thống AI phân tích vấn đề và tư vấn chiến lược dựa trên những
            chiến lược đã áp dụng thành công vào các shop trong công ty
          </p>
        </CardHeader>
      </Card>

      {/* Messages - Fixed height with proper scroll */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 p-0 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}>
                  {message.type === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          Đang phân tích và tìm kiếm chiến lược phù hợp...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.context && message.context.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="text-xs text-gray-600 mb-2">
                              📚 Kiến thức tham khảo ({message.context.length}{" "}
                              chiến lược):
                            </div>
                            <div className="text-xs space-y-1">
                              {message.context
                                .slice(0, 3)
                                .map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-2 rounded text-gray-700">
                                    <strong>{item.industry_application}</strong>{" "}
                                    - Độ liên quan:{" "}
                                    {(item.similarity * 100).toFixed(1)}%
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi bất kì điều gì về chiến lược Shopee hoặc đưa ra tình trạng shop đang gặp phải... (Shift+Enter để xuống dòng)"
              disabled={isLoading}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
