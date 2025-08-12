import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./useAuth";
import { secureLog } from "../lib/utils";

export interface UserExerciseProgress { // This is the canonical definition
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
  exercise_id: string;
  is_completed?: boolean;
  video_completed?: boolean;
  recap_submitted?: boolean;
  time_spent?: number;
  notes?: string;
  completed_at?: string;
}

export const useUserExerciseProgress = (exerciseId?: string) => { // Make exerciseId optional here
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, isPending: isQueryPending } = useQuery({
    queryKey: ["user-exercise-progress", exerciseId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      secureLog("Fetching user exercise progress:", { exerciseId, userId: user.id });

      // If exerciseId is provided, fetch for a single exercise, otherwise fetch all for the user
      let query = supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id);

      if (exerciseId) {
        const { data, error } = await query.eq("exercise_id", exerciseId).maybeSingle();
        if (error) {
          secureLog("Error fetching single user exercise progress:", error);
          throw error;
        }
        return data as UserExerciseProgress | null;
      } else {
        const { data, error } = await query.order("created_at", { ascending: true }); // Order if fetching all
        if (error) {
          secureLog("Error fetching all user exercise progress:", error);
          throw error;
        }
        return data as UserExerciseProgress[];
      }
    },
    enabled: !!user, // Enable if user exists, regardless of exerciseId
  });

  const updateMutation = useMutation({
    mutationFn: async (updateData: UpdateProgressData) => {
      if (!user) throw new Error("User not authenticated");

      secureLog("Updating user exercise progress:", { exerciseId: updateData.exercise_id, userId: user.id, updateData });

      // Fetch existing progress for the specific exercise
      const { data: existingProgress, error: fetchError } = await supabase
        .from("user_exercise_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise_id", updateData.exercise_id)
        .maybeSingle();

      if (fetchError) {
        secureLog("Error fetching existing progress for update:", fetchError);
        throw fetchError;
      }

      const progressToUpsert = {
        user_id: user.id,
        exercise_id: updateData.exercise_id,
        is_completed: updateData.is_completed ?? existingProgress?.is_completed ?? false,
        video_completed: updateData.video_completed ?? existingProgress?.video_completed ?? false,
        recap_submitted: updateData.recap_submitted ?? existingProgress?.recap_submitted ?? false,
        time_spent: updateData.time_spent ?? existingProgress?.time_spent ?? 0,
        notes: updateData.notes ?? existingProgress?.notes ?? null,
        completed_at: updateData.completed_at ?? existingProgress?.completed_at,
        updated_at: new Date().toISOString(),
      };

      const { data: upsertedData, error: upsertError } = await supabase
        .from("user_exercise_progress")
        .upsert(progressToUpsert, { onConflict: 'user_id,exercise_id' }) // Use onConflict for upsert
        .select()
        .single();

      if (upsertError) {
        secureLog("Error upserting user exercise progress:", upsertError);
        throw upsertError;
      }

      return upsertedData;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific query for the updated exercise
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", variables.exercise_id, user?.id] });
      // Invalidate the general query for all progress if it exists
      queryClient.invalidateQueries({ queryKey: ["user-exercise-progress", undefined, user?.id] });
      // Invalidate personal learning stats as well
      queryClient.invalidateQueries({ queryKey: ["personal-learning-stats"] });
    },
    onError: (error) => {
      secureLog("User exercise progress update failed:", error);
    },
  });

  return {
    data: data, // Data is already typed correctly by queryFn
    isLoading: isLoading || isQueryPending,
    error,
    updateProgress: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};