import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReasoningEffort, GPT5_CONSTANTS, ContextMessage, GPT5Request, GPT5PredictionResponse } from "@/constants/gpt5";

export const useGpt5Mini = () => {
  return useMutation<GPT5PredictionResponse, Error, GPT5Request>({
    mutationFn: async (request: GPT5Request) => {
      console.log('🚀 Calling GPT-5 Mini with request:', {
        prompt: request.prompt.substring(0, 100) + '...',
        system_prompt: request.system_prompt?.substring(0, 50) + '...',
        reasoning_effort: request.reasoning_effort,
        conversation_history_length: request.conversation_history?.length || 0,
        has_image: !!request.image_url,
      });

      try {
        const { data, error } = await supabase.functions.invoke('call-replicate-gpt5-mini', {
          body: {
            prompt: request.prompt,
            system_prompt: request.system_prompt || GPT5_CONSTANTS.DEFAULT_SYSTEM_PROMPT,
            reasoning_effort: request.reasoning_effort || GPT5_CONSTANTS.DEFAULT_REASONING_EFFORT,
            conversation_history: request.conversation_history || [],
            image_url: request.image_url, // Pass image_url
          }
        });

        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(`Function error: ${error.message || "Unknown error"}`);
        }

        if (!data) {
          console.error('❌ No data returned from function');
          throw new Error("No data returned from AI service");
        }

        console.log('✅ GPT-5 Mini response received:', {
          id: data.id,
          status: data.status,
          hasStreamUrl: !!data.urls?.stream
        });

        return data;
      } catch (error: any) {
        console.error('❌ GPT-5 Mini error:', error);
        
        if (error.message?.includes('Function not found')) {
          throw new Error("AI service không khả dụng. Vui lòng thử lại sau.");
        }
        
        if (error.message?.includes('timeout')) {
          throw new Error("Yêu cầu AI bị timeout. Vui lòng thử lại.");
        }
        
        throw new Error(error.message || "Không thể kết nối với AI service");
      }
    },
    onError: (error) => {
      console.error('🔥 GPT-5 Mini mutation error:', error);
    },
  });
};