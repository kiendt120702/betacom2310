
import React, { useEffect, useRef, useCallback, useState } from "react";
import { Message } from "@/hooks/useGpt4oChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  sidebarVisible = true,
  onToggleSidebar,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    // Debounce scroll to bottom for better performance
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b">
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="flex items-center gap-2"
            >
              {sidebarVisible ? (
                <>
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Thu nhỏ</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline">Đoạn chat mới</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
        <div className="space-y-4 md:space-y-6 max-w-full">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="max-w-full overflow-hidden">
                <ChatMessage role={msg.role} content={msg.content} />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
              <Bot className="w-12 h-12 md:w-16 md:h-16 mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold break-words">
                Hôm nay bạn muốn làm gì?
              </h2>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-3 md:p-4 border-t">
        <ChatInput onSubmit={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatArea;
