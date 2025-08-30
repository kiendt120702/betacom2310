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

      // Direct queries instead of RPC calls
      const [shopsResult, reportsResult, prevMonthReportsResult] = await Promise.all([
        // Get all shops with profile information
        supabase
          .from('shops')
          .select(`
            *,
            profile:profiles!profile_id(
              id,
              full_name,
              email,
              team_id,
              manager_id
            )
          `),
        
        // Get reports for selected month
        supabase
          .from('comprehensive_reports')
          .select('*')
          .gte('report_date', `${selectedMonth}-01`)
          .lt('report_date', `${selectedMonth}-32`), // A safe way to get all days in the month
        
        // Get reports for previous month
        supabase
          .from('comprehensive_reports')
          .select('*')
          .gte('report_date', `${previousMonth}-01`)
          .lt('report_date', `${previousMonth}-32`)
      ]);

      if (shopsResult.error) throw shopsResult.error;
      if (reportsResult.error) throw reportsResult.error;
      if (prevMonthReportsResult.error) throw prevMonthReportsResult.error;

      const shops: Shop[] = (shopsResult.data as unknown as Shop[]) || [];
      const reports: ComprehensiveReport[] = (reportsResult.data as ComprehensiveReport[]) || [];
      const prevMonthReports: ComprehensiveReport[] = (prevMonthReportsResult.data as ComprehensiveReport[]) || [];

      // Fetch managers separately for reliability
      if (shops.length > 0) {
        const managerIds = [...new Set(shops.map(s => s.profile?.manager_id).filter(Boolean))];
        if (managerIds.length > 0) {
          const { data: managers, error: managerError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', managerIds);
          
          if (managerError) {
            console.error("Error fetching managers for dashboard:", managerError);
          } else {
            const managersMap = new Map(managers.map(m => [m.id, m]));
            shops.forEach(shop => {
              if (shop.profile?.manager_id) {
                const manager = managersMap.get(shop.profile.manager_id);
                if (manager && shop.profile) {
                  shop.profile.manager = manager;
                }
              }
            });
          }
        }
      }

      return { shops, reports, prevMonthReports };
    },
    enabled: !!selectedMonth && !!user,
  });
};