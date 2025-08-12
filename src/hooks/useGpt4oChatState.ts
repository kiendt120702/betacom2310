import { useState, useCallback, useRef, useMemo } from "react";
import { GPT4oMessage, ERROR_MESSAGES } from "@/constants/gpt4o";
import { 
  isTemporaryMessage,
  prepareConversationHistory,
  createUserMessage,
  createAssistantPlaceholder,
  createErrorMessage,
  updateMessageContent,
  replaceMessage,
  generateMessageId,
  getContextSummary
} from "@/utils/gpt4o";

export interface ChatState {
  displayMessages: GPT4oMessage[];
  isStreaming: boolean;
  currentStreamingId: string | null;
}

export interface ChatStateActions {
  setDisplayMessages: (messages: GPT4oMessage[] | ((prev: GPT4oMessage[]) => GPT4oMessage[])) => void;
  setIsStreaming: (streaming: boolean) => void;
  addUserMessage: (conversationId: string, content: string) => GPT4oMessage;
  addAssistantPlaceholder: (conversationId: string) => GPT4oMessage;
  updateStreamingContent: (messageId: string, content: string) => void;
  finalizeStreamingMessage: (messageId: string, content: string) => void;
  addErrorMessage: (conversationId: string, error: string) => void;
  replaceMessageById: (oldId: string, newMessage: GPT4oMessage) => void;
  clearMessages: () => void;
  syncWithDatabase: (dbMessages: GPT4oMessage[]) => void;
  getConversationHistory: () => ReturnType<typeof prepareConversationHistory>;
  hasTemporaryMessages: boolean;
}

/**
 * Custom hook for managing GPT-4o chat state
 * Centralizes all message state management logic
 */
export const useGpt4oChatState = (): ChatState & ChatStateActions => {
  const [displayMessages, setDisplayMessages] = useState<GPT4oMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingRef = useRef<string | null>(null);

  const hasTemporaryMessages = useMemo(() => {
    return displayMessages.some(msg => isTemporaryMessage(msg));
  }, [displayMessages]);

  const addUserMessage = useCallback((conversationId: string, content: string): GPT4oMessage => {
    const userMessage = createUserMessage(conversationId, content);
    console.log('👤 Adding user message:', userMessage.id);
    setDisplayMessages(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  const addAssistantPlaceholder = useCallback((conversationId: string): GPT4oMessage => {
    const placeholder = createAssistantPlaceholder(conversationId);
    setDisplayMessages(prev => [...prev, placeholder]);
    streamingRef.current = placeholder.id;
    return placeholder;
  }, []);

  const updateStreamingContent = useCallback((messageId: string, content: string) => {
    setDisplayMessages(prev => updateMessageContent(prev, messageId, content, "streaming"));
  }, []);

  const finalizeStreamingMessage = useCallback((messageId: string, content: string) => {
    setDisplayMessages(prev => updateMessageContent(prev, messageId, content, "completed"));
    streamingRef.current = null;
    setIsStreaming(false);
  }, []);

  const addErrorMessage = useCallback((conversationId: string, error: string) => {
    const errorMessage = createErrorMessage(conversationId, error);
    
    if (streamingRef.current) {
      setDisplayMessages(prev => replaceMessage(prev, streamingRef.current!, errorMessage));
      streamingRef.current = null;
    } else {
      setDisplayMessages(prev => [...prev, errorMessage]);
    }
    
    setIsStreaming(false);
  }, []);

  const replaceMessageById = useCallback((oldId: string, newMessage: GPT4oMessage) => {
    setDisplayMessages(prev => replaceMessage(prev, oldId, newMessage));
  }, []);

  const clearMessages = useCallback(() => {
    setDisplayMessages([]);
    setIsStreaming(false);
    streamingRef.current = null;
  }, []);

  const syncWithDatabase = useCallback((dbMessages: GPT4oMessage[]) => {
    const currentHasTemp = displayMessages.some(msg => isTemporaryMessage(msg));
    
    if (isStreaming || currentHasTemp) {
      console.log('🔄 Skipping sync - streaming or temp messages present');
      return;
    }
    
    const currentRealMessages = displayMessages.filter(msg => !isTemporaryMessage(msg));
    const isSameContent = currentRealMessages.length === dbMessages.length &&
      currentRealMessages.every((msg, index) => 
        dbMessages[index] && msg.content === dbMessages[index].content
      );
    
    if (!isSameContent) {
      console.log('🔄 Syncing with database:', dbMessages.length, 'messages');
      setDisplayMessages(dbMessages);
    } else {
      console.log('🔄 Skipping sync - content is the same');
    }
  }, [isStreaming, displayMessages]);

  const getConversationHistory = useCallback(() => {
    const history = prepareConversationHistory(displayMessages);
    
    if (history.length > 0) {
      console.log(`🧠 ${getContextSummary(history)}`);
    }
    
    return history;
  }, [displayMessages]);

  const setStreamingState = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    if (!streaming) {
      streamingRef.current = null;
    }
  }, []);

  return {
    displayMessages,
    isStreaming,
    currentStreamingId: streamingRef.current,
    hasTemporaryMessages,
    setDisplayMessages,
    setIsStreaming: setStreamingState,
    addUserMessage,
    addAssistantPlaceholder,
    updateStreamingContent,
    finalizeStreamingMessage,
    addErrorMessage,
    replaceMessageById,
    clearMessages,
    syncWithDatabase,
    getConversationHistory,
  };
};