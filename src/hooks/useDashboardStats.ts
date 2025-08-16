import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface DashboardFilters {
  month?: string;
  teamId?: string;
}

interface ShopPerformance {
  shop_id: string;
  shop_name: string;
  personnel_name: string;
  leader_name: string;
  team_name: string;
  total_revenue: number;
  total_orders: number;
  total_visits: number;
  total_buyers: number;
  new_buyers: number;
  days_active: number;
  averageOrderValue: number;
  conversionRate: number;
  avgRevenuePerDay: number;
  feasible_goal: number;
  breakthrough_goal: number;
  status: 'breakthrough' | 'feasible' | 'underperforming';
}

interface DashboardStats {
  totalShops: number;
  totalEmployees: number;
  shopsBreakthrough: number;
  shopsFeasible: number;
  shopsUnderperforming: number;
  shopPerformance: ShopPerformance[];
  revenueByTeam: Array<{ team_name: string; total_revenue: number; shop_count: number }>;
  monthlyTrend: Array<{ month: string; total_revenue: number; breakthrough_count: number; feasible_count: number }>;
  dailyChartData: Array<{ date: string; revenue: number }>;
}

export const useDashboardStats = (filters: DashboardFilters = {}) => {
  const { user } = useAuth();

  return useOptimizedQuery({
    queryKey: ["dashboard-stats", user?.id, filters.month, filters.teamId],
    dependencies: [user?.id, filters.month, filters.teamId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("User not authenticated");

      const currentMonth = filters.month || new Date().toISOString().slice(0, 7);
      
      let shopQuery = supabase
        .from("comprehensive_reports")
        .select(`
          *,
          shops(
            id,
            name,
            team_id,
            teams(name),
            personnel:employees!shops_personnel_id_fkey(name),
            leader:employees!shops_leader_id_fkey(name)
          )
        `)
        .like("report_date", `${currentMonth}%`)
        .not("shop_id", "is", null);

      if (filters.teamId && filters.teamId !== "all") {
        shopQuery = shopQuery.eq("shops.team_id", filters.teamId);
      }

      const { data: reportData, error: reportError } = await shopQuery;
      if (reportError) throw reportError;

      const shopPerformanceMap = new Map<string, any>();
      const dailyDataMap = new Map<string, { date: string; revenue: number }>();
      
      reportData?.forEach(report => {
        if (!report.shop_id || !report.shops) return;
        
        const existing = shopPerformanceMap.get(report.shop_id);
        if (!existing) {
          shopPerformanceMap.set(report.shop_id, {
            shop_id: report.shop_id,
            shop_name: report.shops.name || 'Unknown',
            personnel_name: report.shops.personnel?.name || 'N/A',
            leader_name: report.shops.leader?.name || 'N/A',
            team_name: report.shops.teams?.name || 'Unknown',
            total_revenue: 0,
            total_orders: 0,
            total_visits: 0,
            total_buyers: 0,
            new_buyers: 0,
            days_active: 0,
            feasible_goal: 0,
            breakthrough_goal: 0,
          });
        }
        
        const shop = shopPerformanceMap.get(report.shop_id);
        shop.total_revenue += report.total_revenue || 0;
        shop.total_orders += report.total_orders || 0;
        shop.total_visits += report.total_visits || 0;
        shop.total_buyers += report.total_buyers || 0;
        shop.new_buyers += report.new_buyers || 0;
        shop.days_active += 1;
        if (report.feasible_goal) shop.feasible_goal = report.feasible_goal;
        if (report.breakthrough_goal) shop.breakthrough_goal = report.breakthrough_goal;

        const date = report.report_date.split('T')[0];
        const existingDay = dailyDataMap.get(date) || { date, revenue: 0 };
        existingDay.revenue += report.total_revenue || 0;
        dailyDataMap.set(date, existingDay);
      });

      const dailyChartData = Array.from(dailyDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const shopPerformance: ShopPerformance[] = Array.from(shopPerformanceMap.values()).map(shop => {
        let status: 'breakthrough' | 'feasible' | 'underperforming' = 'underperforming';
        
        if (shop.breakthrough_goal && shop.total_revenue >= shop.breakthrough_goal) {
          status = 'breakthrough';
        } else if (shop.feasible_goal && shop.total_revenue >= shop.feasible_goal) {
          status = 'feasible';
        }
        
        return { 
          ...shop, 
          status,
          averageOrderValue: shop.total_orders > 0 ? shop.total_revenue / shop.total_orders : 0,
          conversionRate: shop.total_visits > 0 ? (shop.total_orders / shop.total_visits) * 100 : 0,
          avgRevenuePerDay: shop.days_active > 0 ? shop.total_revenue / shop.days_active : 0,
        };
      });

      let totalShopsQuery = supabase
        .from("shops")
        .select("id", { count: "exact", head: true });

      if (filters.teamId && filters.teamId !== "all") {
        totalShopsQuery = totalShopsQuery.eq("team_id", filters.teamId);
      }

      const { count: totalShops } = await totalShopsQuery;

      const { count: totalEmployees } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .neq("role", "deleted");

      const teamRevenue = new Map<string, { total_revenue: number; shop_count: number }>();
      shopPerformance.forEach(shop => {
        const existing = teamRevenue.get(shop.team_name) || { total_revenue: 0, shop_count: 0 };
        existing.total_revenue += shop.total_revenue;
        existing.shop_count += 1;
        teamRevenue.set(shop.team_name, existing);
      });

      const monthlyTrendData = await getMonthlyTrend(filters);

      return {
        totalShops: totalShops || 0,
        totalEmployees: totalEmployees || 0,
        shopsBreakthrough: shopPerformance.filter(s => s.status === 'breakthrough').length,
        shopsFeasible: shopPerformance.filter(s => s.status === 'feasible').length,
        shopsUnderperforming: shopPerformance.filter(s => s.status === 'underperforming').length,
        shopPerformance,
        revenueByTeam: Array.from(teamRevenue.entries()).map(([team_name, data]) => ({
          team_name,
          ...data
        })),
        monthlyTrend: monthlyTrendData,
        dailyChartData,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

async function getMonthlyTrend(filters: DashboardFilters) {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }

  const trendData = await Promise.all(
    months.map(async (month) => {
      let query = supabase
        .from("comprehensive_reports")
        .select(`
          total_revenue,
          feasible_goal,
          breakthrough_goal,
          shops(team_id)
        `)
        .like("report_date", `${month}%`)
        .not("shop_id", "is", null);

      if (filters.teamId && filters.teamId !== "all") {
        query = query.eq("shops.team_id", filters.teamId);
      }

      const { data } = await query;
      
      let total_revenue = 0;
      let breakthrough_count = 0;
      let feasible_count = 0;

      data?.forEach(record => {
        total_revenue += record.total_revenue || 0;
        if (record.breakthrough_goal && (record.total_revenue || 0) >= record.breakthrough_goal) {
          breakthrough_count++;
        } else if (record.feasible_goal && (record.total_revenue || 0) >= record.feasible_goal) {
          feasible_count++;
        }
      });

      return {
        month,
        total_revenue,
        breakthrough_count,
        feasible_count,
      };
    })
  );

  return trendData;
}