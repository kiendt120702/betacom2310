import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGpt4oMini } from "@/hooks/useGpt4oMini";
import { useGpt4oChatState } from "@/hooks/useGpt4oChatState";
import { 
  useConversations, 
  useMessages, 
  useCreateConversation, 
  useAddMessage, 
  useDeleteConversation 
} from "@/hooks/useGpt4oChat";
import ChatSidebar from "@/components/gpt4o/ChatSidebar";
import ChatArea from "@/components/gpt4o/ChatArea";
import { GPT4oStreamingService } from "@/services/gpt4oStreamingService";
import { generateConversationTitle, isTemporaryMessage } from "@/utils/gpt4o";
import { toast } from "sonner";

const Gpt4oMiniPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
    searchParams.get("id")
  );
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const chatState = useGpt4oChatState();
  const streamingServiceRef = useRef<GPT4oStreamingService | null>(null);
  const requestInProgressRef = useRef<boolean>(false);

  const {
    data: conversations,
    isLoading: conversationsLoading,
  } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(
    selectedConversationId
  );
  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const deleteConversationMutation = useDeleteConversation();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (messages && selectedConversationId) {
      console.log(`✉️ Syncing messages for conversation: ${selectedConversationId}`);
      chatState.syncWithDatabase(messages);
    }
  }, [messages, selectedConversationId, chatState]);

  useEffect(() => {
    if (selectedConversationId) {
      setSearchParams({ id: selectedConversationId });
    }
  }, [selectedConversationId, setSearchParams]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      console.log(`💬 Selecting conversation: ${conversationId}`);
      setSelectedConversationId(conversationId);
    },
    []
  );

  const handleNewChat = useCallback(() => {
    console.log('🆕 Starting new chat');
    chatState.clearMessages();
    setSelectedConversationId(null);
    setSearchParams({});
  }, [setSearchParams, chatState]);

  const handleShowHistory = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  const gpt4oMiniMutation = useGpt4oMini({
    onSuccess: async (data, variables) => {
      requestInProgressRef.current = false;
      console.log(`✅ Stream completed for message: ${variables.message}`);
  
      if (!streamingServiceRef.current) {
        console.warn("Streaming service ref is not set in onSuccess");
        return;
      }
  
      const fullContent = streamingServiceRef.current.getFullContent();
      const tempMessageId = streamingServiceRef.current.getTempMessageId();
      streamingServiceRef.current = null;
  
      if (!selectedConversationId) {
        console.log('🏷️ Generating conversation title');
        const title = await generateConversationTitle(fullContent);
  
        createConversationMutation.mutate(title, {
          onSuccess: (newConversation) => {
            console.log(`🏷️ Conversation created with id: ${newConversation.id}`);
            setSelectedConversationId(newConversation.id);
  
            chatState.finalizeStreamingMessage(tempMessageId, fullContent);
            addMessageMutation.mutate({
              conversation_id: newConversation.id,
              role: "assistant",
              content: fullContent,
            });
          },
          onError: (error: any) => {
            console.error("Error creating conversation:", error);
            chatState.addErrorMessage(selectedConversationId || "no-id", error.message || "Failed to create conversation");
            toast.error("Lỗi tạo đoạn chat", { description: error.message });
          },
        });
      } else {
        console.log(`✅ Finalizing streaming message for conversation: ${selectedConversationId}`);
        chatState.finalizeStreamingMessage(tempMessageId, fullContent);
        addMessageMutation.mutate({
          conversation_id: selectedConversationId,
          role: "assistant",
          content: fullContent,
        });
      }
    },
    onError: (error: any, variables) => {
      requestInProgressRef.current = false;
      console.error(`🔥 Stream error for message: ${variables.message}`, error);
  
      if (streamingServiceRef.current) {
        streamingServiceRef.current = null;
      }
  
      chatState.addErrorMessage(selectedConversationId || "no-id", error.message || "Unknown error");
      toast.error("Lỗi tạo tin nhắn", { description: error.message });
    },
  });

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      if (!user) {
        console.warn("User not authenticated");
        return;
      }
  
      if (requestInProgressRef.current) {
        console.warn("Request already in progress");
        return;
      }
  
      requestInProgressRef.current = true;
      console.log(`✉️ Sending message: ${message}`);
  
      const userMessage = chatState.addUserMessage(selectedConversationId || "no-id", message);
      const assistantPlaceholder = chatState.addAssistantPlaceholder(selectedConversationId || "no-id");
  
      if (!streamingServiceRef.current) {
        streamingServiceRef.current = new GPT4oStreamingService(
          assistantPlaceholder.id,
          (content) => {
            chatState.updateStreamingContent(assistantPlaceholder.id, content);
          }
        );
      }
  
      try {
        gpt4oMiniMutation.mutate({
          message: message,
          conversationHistory: chatState.getConversationHistory(),
        });
      } catch (error: any) {
        requestInProgressRef.current = false;
        console.error("Mutation error:", error);
        chatState.addErrorMessage(selectedConversationId || "no-id", error.message || "Mutation failed");
        toast.error("Lỗi gửi tin nhắn", { description: error.message });
      }
    },
    [user, chatState, selectedConversationId, gpt4oMiniMutation]
  );

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="h-screen flex">
      {sidebarVisible && (
        <div className="flex-shrink-0">
          <ChatSidebar
            conversations={conversations}
            isLoading={conversationsLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </div>
      )}
      <div className="flex-1">
        <ChatArea
          messages={chatState.displayMessages}
          isLoading={gpt4oMiniMutation.isPending || chatState.isStreaming || requestInProgressRef.current}
          onSendMessage={handleSendMessage}
          onNewChat={handleNewChat}
          onShowHistory={handleShowHistory}
        />
      </div>
    </div>
  );
};

export default Gpt4oMiniPage;
