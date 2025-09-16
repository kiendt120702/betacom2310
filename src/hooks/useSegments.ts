import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Segment = Tables<'segments'>;

export const useSegments = (departmentId?: string) => {
  return useQuery<Segment[]>({
    queryKey: ["segments", departmentId],
    queryFn: async () => {
      let query = supabase.from("segments").select("*");
      if (departmentId) {
        query = query.eq("department_id", departmentId);
      }
      const { data, error } = await query.order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!departmentId,
  });
};