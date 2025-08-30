import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComprehensiveReport } from "./useComprehensiveReports";
import { Shop } from "./useShops";
import { useAuth } from "./useAuth";
import { format, subMonths } from "date-fns";
import { useMemo } from "react";

export const useSalesDashboardData = (selectedMonth: string) => {
  const { user } = useAuth();

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  return useQuery({
    queryKey: ["salesDashboardData", selectedMonth, user?.id],
    queryFn: async () => {
      if (!selectedMonth || !user) {
        return { reports: [], prevMonthReports: [], shops: [] };
      }

      const [shopsResult, reportsResult, prevMonthReportsResult] = await Promise.all([
        supabase.rpc('get_all_shops_for_dashboard' as any),
        supabase.rpc('get_all_reports_for_dashboard' as any, { month_text: selectedMonth }),
        supabase.rpc('get_all_reports_for_dashboard' as any, { month_text: previousMonth })
      ]);

      if (shopsResult.error) throw shopsResult.error;
      if (reportsResult.error) throw reportsResult.error;
      if (prevMonthReportsResult.error) throw prevMonthReportsResult.error;

      const shops: Shop[] = (shopsResult.data as Shop[]) || [];
      const reports: ComprehensiveReport[] = (reportsResult.data as ComprehensiveReport[]) || [];
      const prevMonthReports: ComprehensiveReport[] = (prevMonthReportsResult.data as ComprehensiveReport[]) || [];

      return { shops, reports, prevMonthReports };
    },
    enabled: !!selectedMonth && !!user,
  });
};