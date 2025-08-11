import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGpt5Mini } from "@/hooks/useGpt5Mini";
import { useGpt5ChatState } from "@/hooks/useGpt5ChatState";
import { useGpt5ImageUpload } from "@/hooks/useGpt5ImageUpload";
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

const Gpt5MiniPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
    searchParams.get("id")
  );
  
  // Use custom chat state management hook
  const chatState = useGpt5ChatState();
  
  // Image upload hook
  const { uploadImage, uploading } = useGpt5ImageUpload();
  
  // Streaming service ref
  const streamingServiceRef = useRef<GPT5StreamingService | null>(null);
  
  // Prevent duplicate requests
  const requestInProgressRef = useRef<boolean>(false);
  
  // Debounced refetch for performance
  const debouncedRefetch = useRef(createDebounce(() => {
    refetchMessages();
  }, GPT5_CONSTANTS.REFETCH_DELAY));

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: dbMessages = [], refetch: refetchMessages } = useMessages(selectedConversationId);

  const createConversationMutation = useCreateConversation();
  const addMessageMutation = useAddMessage();
  const gpt5MiniMutation = useGpt5Mini();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Sync with database messages only when safe
  useEffect(() => {
    // Don't sync if any mutations are pending to prevent conflicts
    const isAnyMutationPending = gpt5MiniMutation.isPending || 
                                 addMessageMutation.isPending ||
                                 createConversationMutation.isPending ||
                                 requestInProgressRef.current;
                                 
    if (!isAnyMutationPending) {
      chatState.syncWithDatabase(dbMessages as any[]);
    }
  }, [dbMessages, gpt5MiniMutation.isPending, addMessageMutation.isPending, createConversationMutation.isPending]);

  // Cleanup on unmount
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

  const handleSendMessage = useCallback(async (prompt: string, image?: File) => {
    // Prevent duplicate requests
    if (requestInProgressRef.current) {
      console.log('🚫 Request already in progress, ignoring duplicate');
      return;
    }

    // Validate input - allow empty prompt if there's an image
    if (!isValidMessage(prompt) && !image) {
      toast.error("Vui lòng nhập tin nhắn hoặc chọn hình ảnh");
      return;
    }

    // Set request in progress flag
    requestInProgressRef.current = true;

    let imageUrl: string | undefined;

    // Upload image if provided
    if (image) {
      console.log('📸 Uploading image...');
      const uploadResult = await uploadImage(image);
      
      if (uploadResult.error) {
        toast.error("Lỗi tải ảnh", { description: uploadResult.error });
        requestInProgressRef.current = false;
        return;
      }
      
      imageUrl = uploadResult.url || undefined;
      console.log('✅ Image uploaded:', imageUrl);
    }

    let conversationId = selectedConversationId;

    // Create conversation if needed
    if (!conversationId) {
      try {
        const title = image ? "Hỏi về hình ảnh" : prompt.substring(0, 50);
        const newConversation = await createConversationMutation.mutateAsync(title);
        conversationId = newConversation.id;
        setSelectedConversationId(conversationId);
        setSearchParams({ id: conversationId });
      } catch (error) {
        requestInProgressRef.current = false;
        toast.error(ERROR_MESSAGES.CREATE_CONVERSATION_ERROR, {
          description: "Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại."
        });
        return;
      }
    }

    if (!conversationId) {
      requestInProgressRef.current = false;
      return;
    }

    // Prepare conversation history BEFORE adding user message to get clean context
    const conversationHistory = prepareConversationHistory(chatState.displayMessages as any[]);
    
    console.log(`🧠 Sending context:`, conversationHistory.length, 'messages');

    // Prepare final prompt with image context
    const finalPrompt = prompt || "Hãy phân tích hình ảnh này";
    const displayContent = image ? `${finalPrompt}\n\n[Đã đính kèm hình ảnh]` : finalPrompt;

    // Add user message to UI optimistically
    const userMessage = chatState.addUserMessage(conversationId, displayContent);
    
    // Save user message to database (no await to prevent blocking)
    addMessageMutation.mutate({
      conversation_id: conversationId,
      role: "user",
      content: displayContent,
    }, {
      onSuccess: (savedMessage) => {
        // Replace temp message with saved message ID
        chatState.replaceMessageById(userMessage.id, {
          ...userMessage,
          id: savedMessage.id || `user-${Date.now()}`,
          status: "completed"
        });
      },
      onError: (error) => {
        console.error('Error saving user message:', error);
      }
    });
    
    const assistantPlaceholder = chatState.addAssistantPlaceholder(conversationId);
    chatState.setIsStreaming(true);

    // Start GPT-5 request with image support
    gpt5MiniMutation.mutate(
      { 
        prompt: finalPrompt,
        conversation_history: conversationHistory,
        image_url: imageUrl // Include image URL if available
      },
      {
        onSuccess: (prediction) => {
          if (!prediction?.urls?.stream) {
            chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.INVALID_RESPONSE);
            requestInProgressRef.current = false;
            return;
          }

          // Create streaming service with callbacks
          const streamingService = createStreamingService({
            onData: (content) => {
              chatState.updateStreamingContent(assistantPlaceholder.id, content);
            },
            
            onDone: (finalContent) => {
              if (finalContent.trim()) {
                // Finalize the streaming message first
                chatState.finalizeStreamingMessage(assistantPlaceholder.id, finalContent);
                
                // Save to database without blocking
                addMessageMutation.mutate({
                  conversation_id: conversationId!,
                  role: "assistant",
                  content: finalContent,
                }, {
                  onSuccess: (savedMessage) => {
                    // Update temp message with database ID
                    chatState.replaceMessageById(assistantPlaceholder.id, {
                      ...assistantPlaceholder,
                      id: savedMessage.id || `assistant-${Date.now()}`,
                      content: finalContent,
                      status: "completed"
                    });
                    
                    console.log('✅ Assistant message saved successfully');
                  },
                  onError: (error) => {
                    console.error('Error saving assistant message:', error);
                    toast.error(ERROR_MESSAGES.SAVE_ERROR, { duration: 2000 });
                  }
                });
              } else {
                chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.EMPTY_RESPONSE);
              }
              
              // Reset request flag when done
              requestInProgressRef.current = false;
            },
            
            onError: (error) => {
              console.error("Streaming error:", error);
              chatState.addErrorMessage(conversationId!, ERROR_MESSAGES.STREAM_ERROR);
              toast.error("Lỗi streaming", { 
                description: "Mất kết nối với AI.",
                duration: 3000
              });
              
              // Reset request flag on error
              requestInProgressRef.current = false;
            }
          });

          // Store reference and start streaming
          streamingServiceRef.current = streamingService;
          streamingService.startStreaming(prediction.urls.stream);
        },
        onError: (error) => {
          console.error("GPT-5 Mini mutation error:", error);
          chatState.addErrorMessage(
            conversationId!, 
            `${ERROR_MESSAGES.API_ERROR}: ${error.message || "Không thể tạo yêu cầu AI."}`
          );
          
          // Reset request flag on error
          requestInProgressRef.current = false;
        },
      }
    );
  }, [selectedConversationId, createConversationMutation, setSearchParams, addMessageMutation, gpt5MiniMutation, chatState, uploadImage]);

  const isLoading = gpt5MiniMutation.isPending || chatState.isStreaming || requestInProgressRef.current || uploading;

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
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Gpt5MiniPage;
