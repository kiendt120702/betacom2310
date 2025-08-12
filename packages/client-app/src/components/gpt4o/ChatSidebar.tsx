
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Conversation } from "@/hooks/useGpt4oChat";
import { useDeleteConversation } from "@/hooks/useGpt4oChat";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteConversationMutation = useDeleteConversation();

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeletingId(conversationId);
    
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      
      // If we deleted the currently selected conversation, go to new chat
      if (selectedConversationId === conversationId) {
        onNewChat();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/50 border-r w-64">
      <div className="p-3 border-b">
        <Button onClick={onNewChat} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Đoạn chat mới
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))
          ) : conversations && conversations.length > 0 ? (
            conversations.map((convo) => (
              <div 
                key={convo.id}
                className="group relative"
              >
                <Button
                  variant={selectedConversationId === convo.id ? "secondary" : "ghost"}
                  className="w-full justify-start pr-8 text-left"
                  onClick={() => onSelectConversation(convo.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm">{convo.title}</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={deletingId === convo.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa cuộc trò chuyện</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa cuộc trò chuyện "{convo.title}"? 
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => handleDeleteConversation(convo.id, e)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
