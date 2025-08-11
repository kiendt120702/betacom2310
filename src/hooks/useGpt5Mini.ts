import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Gpt5MiniInput {
  prompt: string;
  system_prompt?: string;
  reasoning_effort?: "minimal" | "moderate" | "intense";
}

export const useGpt5Mini = () => {
  return useMutation({
    mutationFn: async (input: Gpt5MiniInput) => {
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

      return data.result as string;
    },
    onSuccess: () => {
      toast.success("Phản hồi từ AI đã được tạo thành công!");
    },
    onError: (error: Error) => {
      toast.error("Lỗi khi gọi AI", {
        description: error.message,
      });
    },
  });
};