
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

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: any[];
}

interface ChatInterfaceProps {
  conversationId: string | null;
  botType: "strategy" | "seo";
  onTitleUpdate?: (title: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  botType,
  onTitleUpdate
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messagesTableKey = botType === "strategy" ? "chat_messages" : "seo_chat_messages";
  const functionName = botType === "strategy" ? "chat-strategy" : "seo-chat";

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
        type: msg.role === "user" ? "user" : "bot",
        content: msg.content,
        timestamp: new Date(msg.created_at),
        context: msg.metadata?.context_used || []
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
  }, [conversationId, conversationMessages, botType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        context: data.context,
      };

      setMessages((prev) => [...prev, responseMessage]);

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

  const getContextDisplay = (context: any[], botType: string) => {
    if (botType === "strategy") {
      return (
        <div className="text-xs space-y-1">
          {context.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-gray-700">
              <strong>Mục đích:</strong> {item.formula_a}<br/>
              <strong>Cách thực hiện:</strong> {item.formula_a1}<br/>
              <span className="text-xs text-gray-500">
                Độ liên quan: {(item.similarity * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="text-xs space-y-1">
          {context.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-gray-700">
              <strong>{item.title}</strong> - Độ liên quan: {(item.similarity * 100).toFixed(1)}%
            </div>
          ))}
        </div>
      );
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chọn cuộc hội thoại hoặc tạo mới
          </h3>
          <p className="text-gray-600">
            Bắt đầu cuộc hội thoại mới để nhận tư vấn từ AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      botType === "strategy" ? "bg-blue-600" : "bg-green-600"
                    }`}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? botType === "strategy" 
                          ? "bg-blue-600 text-white"
                          : "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {botType === "strategy" 
                            ? "Đang phân tích và tìm kiếm chiến lược phù hợp..."
                            : "Đang phân tích và tìm kiếm kiến thức SEO phù hợp..."
                          }
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
                              📚 {botType === "strategy" 
                                ? `Kiến thức tham khảo (${message.context.length} chiến lược):`
                                : `Kiến thức SEO tham khảo (${message.context.length} nguồn):`
                              }
                            </div>
                            {getContextDisplay(message.context, botType)}
                          </div>
                        )}
                      </>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.type === "user"
                          ? botType === "strategy" ? "text-blue-100" : "text-green-100"
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

        {/* Input Area */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
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
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`self-end ${
                botType === "seo" ? "bg-green-600 hover:bg-green-700" : ""
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
