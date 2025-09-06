import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type PracticeTest = Tables<'practice_tests'>;

export const useAllPracticeTests = () => {
  return useQuery<Pick<PracticeTest, 'exercise_id' | 'is_active'>[]>({
    queryKey: ["all-practice-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practice_tests")
        .select("exercise_id, is_active");
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// New hook to get the active practice test for an exercise
export const useActivePracticeTest = (exerciseId: string | null) => {
  return useQuery<PracticeTest | null>({
    queryKey: ["active-practice-test", exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      const { data, error } = await supabase
        .from("practice_tests")
        .select("*")
        .eq("exercise_id", exerciseId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!exerciseId,
  });
};