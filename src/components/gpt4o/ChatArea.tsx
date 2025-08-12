import React, { useEffect, useRef, useCallback } from "react";
import { Message } from "@/hooks/useGpt4oChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    // Debounce scroll to bottom for better performance
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-semibold">Hôm nay bạn muốn làm gì?</h2>
              <p className="text-sm mt-2 opacity-60">
                💭 Tôi sẽ nhớ cuộc trò chuyện của chúng ta
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <ChatInput onSubmit={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatArea;