import React, { useEffect, useRef } from "react";
import { Message } from "@/hooks/useGpt5Chat";
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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