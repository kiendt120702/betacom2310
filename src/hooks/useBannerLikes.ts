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

            const { error } = await supabase.from("banner_likes").insert({
                user_id: user.id,
                banner_id: bannerId,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: error.message.includes("duplicate key") ? "Bạn đã thích thumbnail này rồi." : "Không thể thích thumbnail.",
                variant: "destructive",
            });
        },
    });
};

export const useUnlikeBanner = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (bannerId: string) => {
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from("banner_likes")
                .delete()
                .eq("user_id", user.id)
                .eq("banner_id", bannerId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: "Không thể bỏ thích thumbnail.",
                variant: "destructive",
            });
        },
    });
};