import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, endOfMonth } from "date-fns";
import { useTiktokShops } from "./useTiktokShops";

/**
 * Hook for TikTok Goal Setting - simplified data fetching
 * Only fetches necessary data for goal setting interface
 */
export const useTiktokGoalSettingData = (selectedMonth: string) => {
  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();
  
  // Only fetch goals data for the selected month
  const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['tiktok-goals', selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthDate = new Date(Date.UTC(year, month - 1, 1));
      const startDate = format(monthDate, "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .select('shop_id, feasible_goal, breakthrough_goal')
        .gte('report_date', startDate)
        .lte('report_date', endDate);

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute for goals data
  });

  const monthlyShopTotals = useMemo(() => {
    if (shopsLoading || goalsLoading) return [];

    // Create a map of shop goals with robust logic
    const goalsMap = new Map<string, { feasible_goal: number | null; breakthrough_goal: number | null }>();
    
    // Group goals by shop_id
    const goalsByShop: Record<string, {feasible_goal: number | null, breakthrough_goal: number | null}[]> = goalsData.reduce((acc, goal) => {
      if (goal.shop_id) {
        if (!acc[goal.shop_id]) {
          acc[goal.shop_id] = [];
        }
        acc[goal.shop_id].push(goal);
      }
      return acc;
    }, {});

    // For each shop, find the first non-null goal
    Object.keys(goalsByShop).forEach(shopId => {
      const shopGoals = goalsByShop[shopId];
      const feasibleGoal = shopGoals.find(g => g.feasible_goal !== null)?.feasible_goal ?? null;
      const breakthroughGoal = shopGoals.find(g => g.breakthrough_goal !== null)?.breakthrough_goal ?? null;
      goalsMap.set(shopId, { feasible_goal: feasibleGoal, breakthrough_goal: breakthroughGoal });
    });

    return shops.map(shop => ({
      shop_id: shop.id,
      shop_name: shop.name,
      personnel_name: shop.profile?.full_name || shop.profile?.email || "Chưa phân công",
      leader_name: shop.profile?.manager?.full_name || shop.profile?.manager?.email || "Chưa có leader",
      feasible_goal: goalsMap.get(shop.id)?.feasible_goal ?? null,
      breakthrough_goal: goalsMap.get(shop.id)?.breakthrough_goal ?? null,
    }));
  }, [shops, goalsData, shopsLoading, goalsLoading]);

  const leaders = useMemo(() => {
    if (shopsLoading) return [];
    
    const leadersMap = new Map();
    shops.forEach((shop: any) => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, {
            id: manager.id,
            name: manager.full_name || manager.email,
          });
        }
      }
    });
    
    return Array.from(leadersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [shops, shopsLoading]);

  return {
    isLoading: shopsLoading || goalsLoading,
    monthlyShopTotals,
    leaders,
  };
};