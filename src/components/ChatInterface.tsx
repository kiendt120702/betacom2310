"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";

interface ChatInterfaceProps {
  conversationId: string | null;
  botType: "seo"; // Chỉ còn botType "seo"
  onTitleUpdate?: (title: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  botType,
  onTitleUpdate,
}) => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    messagesEndRef,
    config,
    handleSendMessage,
    handleKeyPress,
  } = useChatMessages(conversationId, botType, onTitleUpdate);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-lg text-center">
          <div className={`w-16 h-16 ${config.botColorClass} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
             Chào bạn! Tôi là chuyên gia SEO Shopee.
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Vui lòng chọn một cuộc hội thoại cũ hoặc tạo cuộc hội thoại mới để bắt đầu nhận hỗ trợ tối ưu SEO hiệu quả.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-background`} style={{ width: 'calc(100vw - 256px)', height: 'calc(100vh - 80px)' }}>
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
                  <div className={`w-8 h-8 rounded-full ${config.botColorClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                    message.type === "user"
                      ? `${config.userColorClass} text-white`
                      : "bg-card text-card-foreground border border-border"
                  }`}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        {config.loadingMessage}
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
                        : "text-muted-foreground"
                    }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4 flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholder}
            disabled={isLoading}
            className="flex-1 min-h-[44px] h-11 max-h-[100px] resize-none border-border focus:border-ring rounded-xl shadow-sm bg-background"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`self-end ${config.botColorClass} hover:${config.botColorClass}/90 shadow-sm rounded-xl px-5 h-11`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;