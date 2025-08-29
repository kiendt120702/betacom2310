import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { ComprehensiveReport } from "./useComprehensiveReports";

export const useMonthlyPerformance = (numberOfMonths: number) => {
  return useQuery({
    queryKey: ["monthlyPerformance", numberOfMonths],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = startOfMonth(subMonths(endDate, numberOfMonths - 1));

      const { data, error } = await supabase
        .from("comprehensive_reports")
        .select(`
          report_date,
          total_revenue,
          feasible_goal,
          breakthrough_goal,
          shop_id,
          shops (
            team_id,
            teams ( name ),
            profile:profiles (
              manager_id
            )
          )
        `)
        .gte("report_date", format(startDate, "yyyy-MM-dd"))
        .lte("report_date", format(endOfMonth(endDate), "yyyy-MM-dd"));

      if (error) throw new Error(error.message);
      return data as unknown as (ComprehensiveReport & { shops: { team_id: string, teams: { name: string } | null, profile: { manager_id: string | null } | null } | null })[];
    },
  });
};