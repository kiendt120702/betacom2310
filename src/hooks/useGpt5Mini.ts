import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GPT5Request, GPT5PredictionResponse, ERROR_MESSAGES, GPT5_CONSTANTS } from "@/constants/gpt5";

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
        system_prompt: request.system_prompt || GPT5_CONSTANTS.DEFAULT_SYSTEM_PROMPT,
        reasoning_effort: request.reasoning_effort || GPT5_CONSTANTS.DEFAULT_REASONING_EFFORT,
        conversation_history: request.conversation_history || [],
      };

      const { data, error } = await supabase.functions.invoke(
        "call-replicate-gpt5-mini",
        { body: requestBody }
      );

      if (error) {
        throw new Error(error.message || ERROR_MESSAGES.NO_CONNECTION);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.urls?.stream) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
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