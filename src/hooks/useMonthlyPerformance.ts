import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { ComprehensiveReport } from "./useComprehensiveReports";
import { useAuth } from "./useAuth";

export const useMonthlyPerformance = (numberOfMonths: number) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["monthlyPerformance", numberOfMonths, user?.id],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = startOfMonth(subMonths(endDate, numberOfMonths - 1));

      const { data, error } = await supabase
        .from("shopee_comprehensive_reports")
        .select(`
          report_date,
          total_revenue,
          feasible_goal,
          breakthrough_goal,
          shop_id,
          shops (
            department_id,
            departments:sys_departments ( name ),
            profile:profiles (
              manager_id
            )
          )
        `)
        .gte("report_date", format(startDate, "yyyy-MM-dd"))
        .lte("report_date", format(endOfMonth(endDate), "yyyy-MM-dd"));

      if (error) throw new Error(error.message);
      return data as unknown as (ComprehensiveReport & { shops: { department_id: string, departments: { name: string } | null, profile: { manager_id: string | null } | null } | null })[];
    },
    enabled: !!user,
  });
};