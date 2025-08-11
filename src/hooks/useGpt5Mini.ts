import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Gpt5MiniInput {
  prompt: string;
  system_prompt?: string;
  reasoning_effort?: "minimal" | "low" | "medium" | "high";
}

// Define the expected response structure from Replicate's prediction object
interface PredictionResponse {
  id: string;
  urls: {
    stream: string;
    get: string;
    cancel: string;
  };
  status: string;
  // Add other properties as needed
}

export const useGpt5Mini = () => {
  return useMutation({
    mutationFn: async (input: Gpt5MiniInput): Promise<PredictionResponse> => {
      console.log("Starting GPT-5 Mini request via Supabase Edge Function");
      
      try {
        console.log("Calling Supabase function with input:", input);
        
        const { data, error } = await supabase.functions.invoke(
          "call-replicate-gpt5-mini",
          {
            body: input,
          }
        );

        if (error) {
          console.error("Supabase function error:", error);
          throw new Error(error.message || "Lỗi khi gọi Supabase function");
        }

        console.log("Supabase function response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Check if prediction has required fields
        if (!data || !data.urls || !data.urls.stream) {
          console.error("Invalid prediction response - missing stream URL:", data);
          throw new Error("Phản hồi từ API không hợp lệ - thiếu URL stream");
        }

        // The function returns the entire prediction object
        return data as PredictionResponse;
      } catch (error) {
        console.error("GPT-5 Mini API error:", error);
        if (error instanceof Error) {
          throw new Error(`Lỗi API: ${error.message}`);
        }
        throw new Error("Lỗi không xác định khi gọi API");
      }
    },
    onSuccess: () => {
      toast.success("Đã tạo stream thành công! Bắt đầu nhận phản hồi từ AI.");
    },
    onError: (error: Error) => {
      toast.error("Lỗi khi tạo yêu cầu AI", {
        description: error.message,
      });
    },
  });
};