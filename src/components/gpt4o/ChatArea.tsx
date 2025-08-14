
import React, { useEffect, useRef, useCallback, useState } from "react";
import { Message } from "@/hooks/useGpt4oChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, Menu, MessageSquarePlus, History, Settings } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onNewChat?: () => void;
  onShowHistory?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onNewChat,
  onShowHistory,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, scrollToBottom]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      {/* Header with dropdown menu */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">GPT-4o Mini Chat</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onNewChat && (
              <DropdownMenuItem onClick={onNewChat} className="flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4" />
                Đoạn chat mới
              </DropdownMenuItem>
            )}
            {onShowHistory && (
              <DropdownMenuItem onClick={onShowHistory} className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Lịch sử chat
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
        <div className="space-y-4 md:space-y-6 max-w-full">
          {messages.length > 0 ? (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <Bot className="w-16 h-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Bắt đầu cuộc trò chuyện mới
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Hãy nhập tin nhắn của bạn vào ô bên dưới để bắt đầu trò chuyện với GPT-4o Mini
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 md:p-6">
        <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatArea;
