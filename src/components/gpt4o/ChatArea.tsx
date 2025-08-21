import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { GPT4oMessage } from '@/constants/gpt4o';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';

interface ChatAreaProps {
  messages: GPT4oMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, onSendMessage, sidebarVisible, onToggleSidebar }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-4 border-b">
        {!sidebarVisible && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2">
            <PanelLeftClose className="h-5 w-5 rotate-180" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">GPT-4o Mini Assistant</h2>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare size={48} className="mb-4" />
              <h3 className="text-lg font-semibold">Bắt đầu cuộc trò chuyện</h3>
              <p className="text-sm">Hỏi bất cứ điều gì hoặc bắt đầu với một trong các gợi ý.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatArea;