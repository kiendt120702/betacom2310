
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { secureLog } from "@/lib/utils";

interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  is_completed: boolean;
  video_completed: boolean;
  recap_submitted: boolean;
  time_spent: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface UpdateProgressData {
  is_completed?: boolean;
  video_completed?: boolean;
  recap_submitted?: boolean;
  time_spent?: number;
  notes?: string;
  completed_at?: string;
}

export const useUserExerciseProgress = (exerciseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-exercise-progress", exerciseId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      secureLog("Fetching user exercise progress:", { exerciseId, userId: user.id });

      const { data, error } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId)
        .maybeSingle();

      if (error) {
        secureLog("Error fetching user exercise progress:", error);
        throw error;
      }

      return data as UserExerciseProgress | null;
    },
    enabled: !!user && !!exerciseId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updateData: UpdateProgressData) => {
      if (!user) throw new Error("User not authenticated");

      secureLog("Updating user exercise progress:", { exerciseId, userId: user.id, updateData });

      const progressData = {
        user_id: user.id,
        exercise_id: exerciseId,
        is_completed: updateData.is_completed ?? data?.is_completed ?? false,
        video_completed: updateData.video_completed ?? data?.video_completed ?? false,
        recap_submitted: updateData.recap_submitted ?? data?.recap_submitted ?? false,
        time_spent: updateData.time_spent ?? data?.time_spent ?? 0,
        notes: updateData.notes ?? data?.notes ?? "",
        completed_at: updateData.completed_at ?? data?.completed_at,
      };

      if (data) {
        // Update existing progress
        const { data: updatedData, error } = await supabase
          .from("user_exercise_progress")
          .update(progressData)
          .eq("id", data.id)
          .select()
          .single();

        if (error) {
          secureLog("Error updating user exercise progress:", error);
          throw error;
        }

        return updatedData;
      } else {
        // Create new progress
        const { data: newData, error } = await supabase
          .from("user_exercise_progress")
          .insert(progressData)
          .select()
          .single();

        if (error) {
          secureLog("Error creating user exercise progress:", error);
          throw error;
        }

        return newData;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", exerciseId, user?.id] });
    },
    onError: (error) => {
      secureLog("User exercise progress update failed:", error);
    },
  });

  return {
    data,
    isLoading,
    error,
    updateProgress: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
