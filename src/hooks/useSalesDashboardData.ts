import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComprehensiveReport } from "./useComprehensiveReports";
import { Shop } from "./useShops";
import { useAuth } from "./useAuth";
import { format, subMonths, endOfMonth } from "date-fns";
import { useMemo } from "react";

export const useSalesDashboardData = (selectedMonth: string) => {
  const { user } = useAuth();

  const { previousMonth, selectedMonthEnd, previousMonthEnd } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentMonthDate = new Date(Date.UTC(year, month - 1, 1));
    const prevMonthDate = subMonths(currentMonthDate, 1);
    
    return {
      previousMonth: format(prevMonthDate, "yyyy-MM"),
      selectedMonthEnd: format(endOfMonth(currentMonthDate), "yyyy-MM-dd"),
      previousMonthEnd: format(endOfMonth(prevMonthDate), "yyyy-MM-dd")
    };
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
          .from('shopee_shops')
          .select(`
            *,
            profile:sys_profiles!profile_id(
              id,
              full_name,
              email,
              team_id,
              manager_id
            )
          `),
        
        // Get reports for selected month
        supabase
          .from('shopee_comprehensive_reports')
          .select('*')
          .gte('report_date', `${selectedMonth}-01`)
          .lte('report_date', selectedMonthEnd),
        
        // Get reports for previous month
        supabase
          .from('shopee_comprehensive_reports')
          .select('*')
          .gte('report_date', `${previousMonth}-01`)
          .lte('report_date', previousMonthEnd)
      ]);

if (shopsResult.error) {
throw new Error(shopsResult.error.message);
      }
      if (reportsResult.error) {
throw new Error(reportsResult.error.message);
      }
      if (prevMonthReportsResult.error) {
throw new Error(prevMonthReportsResult.error.message);
      }

      const shops: Shop[] = (shopsResult.data as unknown as Shop[]) || [];
      const reports: ComprehensiveReport[] = (reportsResult.data as ComprehensiveReport[]) || [];
      const prevMonthReports: ComprehensiveReport[] = (prevMonthReportsResult.data as ComprehensiveReport[]) || [];

// Fetch managers separately for reliability
      if (shops.length > 0) {
        const managerIds = [...new Set(shops.map(s => s.profile?.manager_id).filter(Boolean))];
        if (managerIds.length > 0) {
          const { data: managers, error: managerError } = await supabase
            .from('sys_profiles')
            .select('id, full_name, email')
            .in('id', managerIds);
          
          if (managerError) {
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