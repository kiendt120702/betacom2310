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
    const currentMonthDate = new Date(year, month - 1, 1);
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
      console.log("🔍 [useSalesDashboardData] Starting query with:", { selectedMonth, userId: user?.id });
      
      if (!selectedMonth || !user) {
        console.log("❌ [useSalesDashboardData] Missing selectedMonth or user:", { selectedMonth, user: !!user });
        return { reports: [], prevMonthReports: [], shops: [] };
      }

      console.log("📅 [useSalesDashboardData] Date calculations:", { 
        previousMonth, 
        selectedMonthEnd, 
        previousMonthEnd 
      });

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
          .lte('report_date', selectedMonthEnd),
        
        // Get reports for previous month
        supabase
          .from('comprehensive_reports')
          .select('*')
          .gte('report_date', `${previousMonth}-01`)
          .lte('report_date', previousMonthEnd)
      ]);

      console.log("📊 [useSalesDashboardData] Query results received:", {
        shopsCount: shopsResult.data?.length || 0,
        reportsCount: reportsResult.data?.length || 0,
        prevReportsCount: prevMonthReportsResult.data?.length || 0,
        shopsError: shopsResult.error,
        reportsError: reportsResult.error,
        prevReportsError: prevMonthReportsResult.error
      });

      if (shopsResult.error) {
        console.error("❌ [useSalesDashboardData] Shops query error:", shopsResult.error);
        throw shopsResult.error;
      }
      if (reportsResult.error) {
        console.error("❌ [useSalesDashboardData] Reports query error:", reportsResult.error);
        throw reportsResult.error;
      }
      if (prevMonthReportsResult.error) {
        console.error("❌ [useSalesDashboardData] Previous month reports query error:", prevMonthReportsResult.error);
        throw prevMonthReportsResult.error;
      }

      const shops: Shop[] = (shopsResult.data as unknown as Shop[]) || [];
      const reports: ComprehensiveReport[] = (reportsResult.data as ComprehensiveReport[]) || [];
      const prevMonthReports: ComprehensiveReport[] = (prevMonthReportsResult.data as ComprehensiveReport[]) || [];

      console.log("🏪 [useSalesDashboardData] Parsed data:", {
        shopsLength: shops.length,
        reportsLength: reports.length,
        prevMonthReportsLength: prevMonthReports.length
      });

      // Fetch managers separately for reliability
      if (shops.length > 0) {
        const managerIds = [...new Set(shops.map(s => s.profile?.manager_id).filter(Boolean))];
        console.log("👥 [useSalesDashboardData] Manager IDs found:", managerIds);
        
        if (managerIds.length > 0) {
          const { data: managers, error: managerError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', managerIds);
          
          if (managerError) {
            console.error("❌ [useSalesDashboardData] Error fetching managers:", managerError);
          } else {
            console.log("✅ [useSalesDashboardData] Managers fetched:", managers?.length || 0);
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

      console.log("🎯 [useSalesDashboardData] Final result:", {
        shopsCount: shops.length,
        reportsCount: reports.length,
        prevMonthReportsCount: prevMonthReports.length,
        hasManagers: shops.some(s => s.profile?.manager)
      });

      return { shops, reports, prevMonthReports };
    },
    enabled: !!selectedMonth && !!user,
  });
};