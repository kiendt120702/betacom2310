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
  Message,
} from "@/hooks/useGpt4oChat";
import ChatSidebar from "@/components/gpt4o/ChatSidebar";
import ChatArea from "@/components/gpt4o/ChatArea";
import { toast } from "sonner";
import { GPT4oStreamingService, createStreamingService } from "@/services/gpt4oStreamingService";
import { ERROR_MESSAGES, GPT4O_CONSTANTS } from "@/constants/gpt4o";
import { isValidMessage, createDebounce, prepareConversationHistory } from "@/utils/gpt4o";

const Gpt4oMiniPage = () => {
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
  const debouncedRefetch = useRef(createDebounce(() => {
    refetchMessages();
  }, GPT4O_CONSTANTS.REFETCH_DELAY));

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [], refetch: refetchMessages } = useMessages(selectedConversationId);

  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const gpt4oMiniMutation = useGpt4oMini();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    const isAnyMutationPending = gpt4oMiniMutation.isPending || 
                                 addMessageMutation.isPending ||
                                 createConversationMutation.isPending ||
                                 requestInProgressRef.current;
                                 
    if (!isAnyMutationPending) {
      chatState.syncWithDatabase(dbMessages as any[]);
    }
  }, [dbMessages, gpt4oMiniMutation.isPending, addMessageMutation.isPending, createConversationMutation.isPending]);

  useEffect(() => {
    return () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.stopStreaming();
      }
      requestInProgressRef.current = false;
    };
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    if (streamingServiceRef.current) {
      streamingServiceRef.current.stopStreaming();
    }
    chatState.setIsStreaming(false);
    requestInProgressRef.current = false;
    
    setSelectedConversationId(id);
    setSearchParams({ id });
  }, [setSearchParams, chatState]);

  const handleNewChat = useCallback(() => {
    if (streamingServiceRef.current) {
      streamingServiceRef.current.stopStreaming();
    }
    
    chatState.setIsStreaming(false);
    chatState.clearMessages();
    requestInProgressRef.current = false;
    
    setSelectedConversationId(null);
    setSearchParams({});
  }, [setSearchParams, chatState]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (requestInProgressRef.current) {
      console.log('🚫 Request already in progress, ignoring duplicate');
      return;
    }

    if (!isValidMessage(prompt)) {
      toast.error("Vui lòng nhập tin nhắn.");
      return;
    }

    requestInProgressRef.current = true;

    let conversationId = selectedConversationId;
    const messageContent = prompt;

    if (!conversationId) {
      try {
        const newConversation = await createConversationMutation.mutateAsync(
          messageContent.substring(0, 50) || "Cuộc trò chuyện mới"
        );
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
        setSearchParams({ id: conversationId });
      } catch (error) {
        requestInProgressRef.current = false;
        toast.error(ERROR_MESSAGES.CREATE_CONVERSATION_ERROR);
        return;
      }
    }

    if (!conversationId) {
      requestInProgressRef.current = false;
      return;
    }

    const conversationHistory = prepareConversationHistory(chatState.displayMessages as any[]);
    
    const userMessage = chatState.addUserMessage(conversationId, prompt);
    
    addMessageMutation.mutate({
      conversation_id: conversationId,
      role: "user",
      content: prompt,
    }, {
      onSuccess: (savedMessage) => {
        chatState.replaceMessageById(userMessage.id, {
          ...userMessage,
          id: savedMessage.id || `user-${Date.now()}`,
          status: "completed"
        });
      }
    });
    
    const assistantPlaceholder = chatState.addAssistantPlaceholder(conversationId);
    chatState.setIsStreaming(true);

    gpt4oMiniMutation.mutate(
      { 
        prompt,
        conversation_history: conversationHistory,
      },
      {
        onSuccess: (prediction) => {
          if (!prediction?.urls?.stream) {
            chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.INVALID_RESPONSE);
            requestInProgressRef.current = false;
            return;
          }

          const streamingService = createStreamingService({
            onData: (content) => {
              chatState.updateStreamingContent(assistantPlaceholder.id, content);
            },
            onDone: (finalContent) => {
              if (finalContent.trim()) {
                chatState.finalizeStreamingMessage(assistantPlaceholder.id, finalContent);
                addMessageMutation.mutate({
                  conversation_id: conversationId!,
                  role: "assistant",
                  content: finalContent,
                }, {
                  onSuccess: (savedMessage) => {
                    chatState.replaceMessageById(assistantPlaceholder.id, {
                      ...assistantPlaceholder,
                      id: savedMessage.id || `assistant-${Date.now()}`,
                      content: finalContent,
                      status: "completed"
                    });
                  }
                });
              } else {
                chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.EMPTY_RESPONSE);
              }
              requestInProgressRef.current = false;
            },
            onError: (error) => {
              chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.STREAM_ERROR);
              requestInProgressRef.current = false;
            }
          });

          streamingServiceRef.current = streamingService;
          streamingService.startStreaming(prediction.urls.stream);
        },
        onError: (error) => {
          chatState.addErrorMessage(
            conversationId!, 
            `${ERROR_MESSAGES.API_ERROR}: ${error.message || "Không thể tạo yêu cầu AI."}`
          );
          requestInProgressRef.current = false;
        },
      }
    );
  }, [selectedConversationId, createConversationMutation, setSearchParams, addMessageMutation, gpt4oMiniMutation, chatState]);

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
          sidebarVisible={sidebarVisible}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </div>
  );
};

export default Gpt4oMiniPage;
