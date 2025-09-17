import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type CheckpointAttempt = Tables<'checkpoint_attempts'>;

export const useUserCheckpointSubmissions = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['checkpoint_attempts', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('checkpoint_attempts')
                .select('exercise_id, submitted_at')
                .eq('user_id', user.id);
            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
};

export const useSubmitCheckpoint = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: { exercise_id: string; answers: any }) => {
            if (!user) throw new Error("User not authenticated");
            const { error } = await supabase
                .from('checkpoint_attempts')
                .insert({
                    user_id: user.id,
                    exercise_id: data.exercise_id,
                    answers: data.answers,
                });
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['checkpoint_attempts', user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", variables.exercise_id, user?.id] });
            queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", undefined, user?.id] });
            toast({ title: "Thành công", description: "Đã nộp bài kiểm tra." });
        },
        onError: (error: Error) => {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        }
    });
};