import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export const useLikeBanner = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (bannerId: string) => {
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase.rpc("increment_like_count" as any, {
                banner_id_param: bannerId,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: "Không thể thích thumbnail.",
                variant: "destructive",
            });
        },
    });
};