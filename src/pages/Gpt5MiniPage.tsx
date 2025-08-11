import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGpt5Mini } from "@/hooks/useGpt5Mini";
import { useGpt5ChatState } from "@/hooks/useGpt5ChatState";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  useAddMessage,
  Message,
} from "@/hooks/useGpt5Chat";
import ChatSidebar from "@/components/gpt5/ChatSidebar";
import ChatArea from "@/components/gpt5/ChatArea";
import { toast } from "sonner";
import { GPT5StreamingService, createStreamingService } from "@/services/gpt5StreamingService";
import { ERROR_MESSAGES, GPT5_CONSTANTS } from "@/constants/gpt5";
import { isValidMessage, createDebounce, prepareConversationHistory } from "@/utils/gpt5";
import { useImageUpload } from "@/hooks/useImageUpload"; // Import image upload hook

const Gpt5MiniPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
    searchParams.get("id")
  );
  
  const chatState = useGpt5ChatState();
  const streamingServiceRef = useRef<GPT5StreamingService | null>(null);
  const requestInProgressRef = useRef<boolean>(false);
  const debouncedRefetch = useRef(createDebounce(() => {
    refetchMessages();
  }, GPT5_CONSTANTS.REFETCH_DELAY));

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [], refetch: refetchMessages } = useMessages(selectedConversationId);

  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const gpt5MiniMutation = useGpt5Mini();
  const { uploadImage, uploading: isUploadingImage } = useImageUpload(); // Use image upload hook

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    const isAnyMutationPending = gpt5MiniMutation.isPending || 
                                 addMessageMutation.isPending ||
                                 createConversationMutation.isPending ||
                                 requestInProgressRef.current;
                                 
    if (!isAnyMutationPending) {
      chatState.syncWithDatabase(dbMessages as any[]);
    }
  }, [dbMessages, gpt5MiniMutation.isPending, addMessageMutation.isPending, createConversationMutation.isPending]);

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

  const handleSendMessage = useCallback(async (prompt: string, imageFile: File | null) => {
    if (requestInProgressRef.current) {
      console.log('🚫 Request already in progress, ignoring duplicate');
      return;
    }

    if (!isValidMessage(prompt) && !imageFile) {
      toast.error("Vui lòng nhập tin nhắn hoặc tải lên một ảnh.");
      return;
    }

    requestInProgressRef.current = true;

    let conversationId = selectedConversationId;
    let imageUrl: string | null = null;

    // Upload image if it exists
    if (imageFile) {
      toast.info("Đang tải ảnh lên...");
      const { url, error } = await uploadImage(imageFile);
      if (error || !url) {
        toast.error(ERROR_MESSAGES.IMAGE_UPLOAD_ERROR, { description: error });
        requestInProgressRef.current = false;
        return;
      }
      imageUrl = url;
      toast.success("Tải ảnh lên thành công!");
    }

    if (!conversationId) {
      try {
        const newConversation = await createConversationMutation.mutateAsync(
          prompt.substring(0, 50) || "Cuộc trò chuyện về ảnh"
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
    
    const userMessage = chatState.addUserMessage(conversationId, prompt, imageUrl ? [imageUrl] : undefined);
    
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

    gpt5MiniMutation.mutate(
      { 
        prompt,
        conversation_history: conversationHistory,
        image_url: imageUrl, // Pass image URL to mutation
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
  }, [selectedConversationId, createConversationMutation, setSearchParams, addMessageMutation, gpt5MiniMutation, chatState, uploadImage]);

  return (
    <div className="h-screen flex">
      <div className="flex-shrink-0">
        <ChatSidebar
          conversations={conversations}
          isLoading={conversationsLoading}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>
      <div className="flex-1">
        <ChatArea
          messages={chatState.displayMessages}
          isLoading={gpt5MiniMutation.isPending || chatState.isStreaming || requestInProgressRef.current || isUploadingImage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Gpt5MiniPage;