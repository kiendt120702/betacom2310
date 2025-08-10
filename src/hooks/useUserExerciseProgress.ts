
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { secureLog } from "@/lib/utils";

export interface UserExerciseProgress {
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

export const useUserExerciseProgress = (exerciseId: string) => {
  const [progress, setProgress] = useState<UserExerciseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_exercise_progress")
          .select("*")
          .eq("exercise_id", exerciseId)
          .single();

        if (error && error.code !== "PGRST116") {
          secureLog("Error fetching exercise progress:", error);
          return;
        }

        setProgress(data);
      } catch (error) {
        secureLog("Error in fetchProgress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (exerciseId) {
      fetchProgress();
    }
  }, [exerciseId]);

  const updateProgress = async (updates: Partial<UserExerciseProgress>) => {
    try {
      const { data, error } = await supabase
        .from("user_exercise_progress")
        .upsert({
          exercise_id: exerciseId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        secureLog("Error updating exercise progress:", error);
        throw error;
      }

      setProgress(data);
      return data;
    } catch (error) {
      secureLog("Error in updateProgress:", error);
      throw error;
    }
  };

  return {
    progress,
    isLoading,
    updateProgress,
  };
};
