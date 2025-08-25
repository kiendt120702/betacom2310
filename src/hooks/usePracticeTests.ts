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
      if (error) throw error;
      return data;
    },
  });
};