import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRefreshBannerStats = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("refresh_banner_statistics");

      if (error) {
        console.error("Error refreshing banner statistics:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-statistics"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thống kê banner.",
      });
    },
    onError: (error) => {
      console.error("Failed to refresh banner statistics:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thống kê banner.",
        variant: "destructive",
      });
    },
  });
};
