import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare } from "lucide-react";
import { Conversation } from "@/hooks/useGpt5Chat";

interface ChatSidebarProps {
  conversations: Conversation[] | undefined;
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
    <div className="flex flex-col h-full bg-muted/50 border-r">
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Đoạn chat mới
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))
          ) : conversations && conversations.length > 0 ? (
            conversations.map((convo) => (
              <Button
                key={convo.id}
                variant={selectedConversationId === convo.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectConversation(convo.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="truncate">{convo.title}</span>
              </Button>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              Chưa có cuộc trò chuyện nào.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;