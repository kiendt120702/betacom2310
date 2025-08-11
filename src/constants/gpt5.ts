// GPT-5 Mini Constants
export const GPT5_CONSTANTS = {
  // Streaming
  UPDATE_THROTTLE: 100, // ms
  MAX_CONTEXT_MESSAGES: 10,
  
  // Timeouts
  REFETCH_DELAY: 500, // ms
  SCROLL_DEBOUNCE: 100, // ms
  
  // UI
  MAX_TEXTAREA_HEIGHT: 120, // px
  MIN_TEXTAREA_HEIGHT: 40, // px
  
  // Model settings
  DEFAULT_REASONING_EFFORT: "medium" as const,
  DEFAULT_SYSTEM_PROMPT: "You are a helpful AI assistant. You have access to the previous conversation context. Use this context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.",
} as const;

// Reasoning effort types
export type ReasoningEffort = "minimal" | "low" | "medium" | "high";

// Message states
export type MessageStatus = "sending" | "streaming" | "completed" | "error";

// GPT-5 specific message interface
export interface GPT5Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  status?: MessageStatus;
}

// Context message format for API
export interface ContextMessage {
  role: "user" | "assistant";
  content: string;
}

// API request interface
export interface GPT5Request {
  prompt: string;
  system_prompt?: string;
  reasoning_effort?: ReasoningEffort;
  conversation_history?: ContextMessage[];
}

// API response interface
export interface GPT5PredictionResponse {
  id: string;
  urls: {
    stream: string;
    get: string;
    cancel: string;
  };
  status: string;
}

// Streaming events
export const STREAMING_EVENTS = {
  OUTPUT: "output",
  DONE: "done",
  ERROR: "error",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NO_CONNECTION: "Không thể kết nối với AI service",
  INVALID_RESPONSE: "Phản hồi từ AI service không hợp lệ", 
  STREAM_ERROR: "⚠️ Lỗi kết nối streaming. Vui lòng thử lại.",
  EMPTY_RESPONSE: "⚠️ AI chưa phản hồi. Thử lại câu hỏi khác.",
  API_ERROR: "❌ Lỗi API",
  SAVE_ERROR: "Lỗi lưu tin nhắn",
  CREATE_CONVERSATION_ERROR: "Lỗi tạo cuộc trò chuyện",
} as const;