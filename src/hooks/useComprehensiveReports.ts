import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ComprehensiveReport = Tables<'comprehensive_reports'>;

export const useComprehensiveReports = (filters: { month?: string }) => {
  return useQuery<ComprehensiveReport[]>({
    queryKey: ["comprehensiveReports", filters],
    queryFn: async () => {
      let query = supabase.from("comprehensive_reports").select("*");

      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        query = query.gte('report_date', startDate).lte('report_date', endDate);
      }

      const { data, error } = await query.order("report_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!filters.month,
  });
};