import { GPT5Message, ContextMessage, MessageStatus, ERROR_MESSAGES } from "@/constants/gpt5";
import { GPT5_CONSTANTS } from "@/constants/gpt5";

/**
 * Generate unique message ID
 */
export const generateMessageId = (prefix: string = "msg"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if message is temporary (not saved to database)
 */
export const isTemporaryMessage = (message: GPT5Message): boolean => {
  return message.id.startsWith('temp-') || message.id.startsWith('error-');
};

/**
 * Filter out temporary messages
 */
export const filterRealMessages = (messages: GPT5Message[]): GPT5Message[] => {
  return messages.filter(msg => !isTemporaryMessage(msg));
};

/**
 * Prepare conversation history for API context
 */
export const prepareConversationHistory = (messages: GPT5Message[]): ContextMessage[] => {
  return filterRealMessages(messages)
    .slice(-GPT5_CONSTANTS.MAX_CONTEXT_MESSAGES)
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
};

/**
 * Create user message object
 */
export const createUserMessage = (
  conversationId: string, 
  content: string,
  imageUrls?: string[] // Added imageUrls
): GPT5Message => ({
  id: generateMessageId("temp-user"),
  conversation_id: conversationId,
  role: "user",
  content,
  image_urls: imageUrls, // Added imageUrls
  created_at: new Date().toISOString(),
  status: "sending",
});

/**
 * Create assistant message placeholder
 */
export const createAssistantPlaceholder = (
  conversationId: string
): GPT5Message => ({
  id: generateMessageId("temp-assistant"),
  conversation_id: conversationId,
  role: "assistant",
  content: "",
  created_at: new Date().toISOString(),
  status: "streaming",
});

/**
 * Create error message
 */
export const createErrorMessage = (
  conversationId: string,
  errorContent: string
): GPT5Message => ({
  id: generateMessageId("error"),
  conversation_id: conversationId,
  role: "assistant",
  content: errorContent,
  created_at: new Date().toISOString(),
  status: "error",
});

/**
 * Update message content
 */
export const updateMessageContent = (
  messages: GPT5Message[],
  messageId: string,
  newContent: string,
  status?: MessageStatus
): GPT5Message[] => {
  return messages.map(msg => 
    msg.id === messageId 
      ? { ...msg, content: newContent, status: status || msg.status }
      : msg
  );
};

/**
 * Replace message by ID
 */
export const replaceMessage = (
  messages: GPT5Message[],
  oldId: string,
  newMessage: GPT5Message
): GPT5Message[] => {
  return messages.map(msg => 
    msg.id === oldId ? newMessage : msg
  );
};

/**
 * Parse streaming data (handle JSON or plain text)
 */
export const parseStreamData = (data: string): string => {
  try {
    const parsed = JSON.parse(data);
    return parsed.data || parsed.output || parsed;
  } catch {
    return data;
  }
};

/**
 * Validate message content
 */
export const isValidMessage = (content: string): boolean => {
  return content && content.trim().length > 0;
};

/**
 * Get context summary for logging
 */
export const getContextSummary = (history: ContextMessage[]): string => {
  if (history.length === 0) return "Không có context";
  return `${history.length} tin nhắn làm context`;
};

/**
 * Throttle function for performance optimization
 */
export const createThrottle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

/**
 * Debounce function
 */
export const createDebounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Clean up EventSource connection
 */
export const cleanupEventSource = (eventSource: EventSource | null): void => {
  if (eventSource) {
    eventSource.close();
  }
};

/**
 * Format error for user display
 */
export const formatErrorMessage = (error: Error): string => {
  if (error.message.includes('fetch')) {
    return ERROR_MESSAGES.NO_CONNECTION;
  }
  if (error.message.includes('stream')) {
    return ERROR_MESSAGES.STREAM_ERROR;
  }
  return `${ERROR_MESSAGES.API_ERROR}: ${error.message}`;
};