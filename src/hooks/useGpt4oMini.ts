import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContextMessage, GPT4oRequest, GPT4oPredictionResponse } from "@/constants/gpt4o";

export const useGpt4oMini = () => {
  return useMutation<GPT4oPredictionResponse, Error, GPT4oRequest>({
    mutationFn: async (request: GPT4oRequest) => {
      console.log('🚀 Calling GPT-4o Mini with request:', {
        prompt: request.prompt.substring(0, 100) + '...',
        system_prompt: request.system_prompt?.substring(0, 50) + '...',
        temperature: request.temperature,
        top_p: request.top_p,
        conversation_history_length: request.conversation_history?.length || 0,
      });

      try {
        const { data, error } = await supabase.functions.invoke('call-replicate-gpt4o-mini', {
          body: {
            prompt: request.prompt,
            system_prompt: request.system_prompt || "You are a helpful assistant. You have access to the previous conversation context. Use this context to:\n1. Remember what the user has asked before\n2. Refer to previous topics when relevant\n3. Build upon earlier discussions\n4. Provide coherent, contextual responses\n5. Respond in Vietnamese when the user writes in Vietnamese, and in English otherwise\n\nAlways be helpful, accurate, and maintain conversation continuity.",
            temperature: request.temperature || 1,
            top_p: request.top_p || 1,
            presence_penalty: request.presence_penalty || 0,
            frequency_penalty: request.frequency_penalty || 0,
            max_completion_tokens: request.max_completion_tokens || 4096,
            conversation_history: request.conversation_history || [],
          }
        });

        if (error) {
          console.error('❌ Supabase function error:', error);
          console.error('❌ Full error details:', JSON.stringify(error, null, 2));
          
          if (error.message?.includes('Function not found')) {
            throw new Error("Edge Function 'call-replicate-gpt4o-mini' not found or not deployed");
          }
          
          if (error.message?.includes('REPLICATE_API_TOKEN')) {
            throw new Error("REPLICATE_API_TOKEN not configured in Supabase secrets");
          }
          
          throw new Error(`Function error: ${error.message || "Unknown error"}`);
        }

        if (!data) {
          console.error('❌ No data returned from function');
          throw new Error("No data returned from AI service");
        }

        console.log('✅ GPT-4o Mini response received:', {
          id: data.id,
          status: data.status,
          hasStreamUrl: !!data.urls?.stream
        });

        return data;
      } catch (error: any) {
        console.error('❌ GPT-4o Mini error:', error);
        
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
      console.error('🔥 GPT-4o Mini mutation error:', error);
    },
  });
};