import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Gpt5MiniInput {
  prompt: string;
  system_prompt?: string;
  reasoning_effort?: "minimal" | "moderate" | "intense";
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
      const { data, error } = await supabase.functions.invoke(
        "call-replicate-gpt5-mini",
        {
          body: input,
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // The function now returns the entire prediction object
      return data as PredictionResponse;
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