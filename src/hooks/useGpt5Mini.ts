
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GPT5Request {
  prompt: string;
  system_prompt?: string;
  reasoning_effort?: string;
  conversation_history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface GPT5PredictionResponse {
  id: string;
  urls: {
    stream: string;
    get: string;
    cancel: string;
  };
  status: string;
}

/**
 * Custom hook for GPT-5 Mini API integration
 * Handles API calls through Supabase Edge Functions
 */
export const useGpt5Mini = () => {
  return useMutation({
    mutationKey: ["gpt5-mini"],
    
    mutationFn: async (request: GPT5Request): Promise<GPT5PredictionResponse> => {
      const requestBody = {
        prompt: request.prompt,
        system_prompt: request.system_prompt || "You are a helpful AI assistant. You have access to the previous conversation context. Use this context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.",
        reasoning_effort: request.reasoning_effort || "medium",
        conversation_history: request.conversation_history || [],
      };

      const { data, error } = await supabase.functions.invoke(
        "call-replicate-gpt5-mini",
        { body: requestBody }
      );

      if (error) {
        throw new Error(error.message || "Không thể kết nối với AI service");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.urls?.stream) {
        throw new Error("Phản hồi từ AI service không hợp lệ");
      }

      return data as GPT5PredictionResponse;
    },

    onSuccess: (data, variables) => {
      // Optional: Log successful request for debugging
      console.log(`✅ GPT-5 prediction created:`, data.id);
    },

    onError: (error: Error, variables) => {
      console.error("🚫 GPT-5 API Error:", error.message);
      toast.error("Không thể kết nối AI", {
        description: error.message || "Vui lòng thử lại sau",
        duration: 3000,
      });
    },

    retry: 1, // Retry once on failure
    retryDelay: 1000, // 1 second delay before retry
  });
};

/**
 * Type exports for external use
 */
export type { GPT5Request, GPT5PredictionResponse };
