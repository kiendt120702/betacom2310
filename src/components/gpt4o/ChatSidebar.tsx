import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare } from 'lucide-react';
import { Conversation } from '@/hooks/useGpt4oChat';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  conversations?: Conversation[];
  isLoading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}) => {
  return (
    <div className="flex flex-col h-full w-64 bg-muted/40 border-r">
      <div className="p-4">
        <Button className="w-full" onClick={onNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && <p className="p-2 text-sm text-muted-foreground">Loading...</p>}
          {conversations?.map((convo) => (
            <Button
              key={convo.id}
              variant="ghost"
              className={cn(
                "w-full justify-start truncate",
                selectedConversationId === convo.id && "bg-accent"
              )}
              onClick={() => onSelectConversation(convo.id)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {convo.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;