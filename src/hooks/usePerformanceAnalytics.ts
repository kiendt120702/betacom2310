import { useMemo } from "react";
import { getShopColorCategory } from "@/utils/reportUtils";
import type { ShopReportData, UnderperformingShop, PersonnelAchievement } from "@/types/reports";

export const usePerformanceAnalytics = (monthlyShopTotals: ShopReportData[]) => {
  return useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = { green: 0, yellow: 0, red: 0, purple: 0, noColor: 0 };
    const underperformingShops: UnderperformingShop[] = [];
    const personnelIds = new Set<string>();
    const personnelBreakthrough = new Set<string>();
    const personnelFeasible = new Set<string>();
    const personnelBreakthroughDetails: { [key: string]: PersonnelAchievement } = {};
    const personnelFeasibleDetails: { [key: string]: PersonnelAchievement } = {};

    monthlyShopTotals.forEach((shop) => {
      const personnelKey = shop.personnel_id || shop.personnel_name;
      if (personnelKey) personnelIds.add(personnelKey);

      const category = getShopColorCategory(shop);
      switch (category) {
        case "green":
          colorCounts.green++;
          if (personnelKey) {
            personnelBreakthrough.add(personnelKey);
            personnelFeasible.add(personnelKey);
            if (!personnelBreakthroughDetails[personnelKey]) personnelBreakthroughDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelBreakthroughDetails[personnelKey].shop_names.push(shop.shop_name);
            if (!personnelFeasibleDetails[personnelKey]) personnelFeasibleDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelFeasibleDetails[personnelKey].shop_names.push(shop.shop_name);
          }
          break;
        case "yellow":
          colorCounts.yellow++;
          if (personnelKey) {
            personnelFeasible.add(personnelKey);
            if (!personnelFeasibleDetails[personnelKey]) personnelFeasibleDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelFeasibleDetails[personnelKey].shop_names.push(shop.shop_name);
          }
          break;
        case "red": colorCounts.red++; break;
        case "purple":
          colorCounts.purple++;
          if (shop.feasible_goal && shop.feasible_goal > 0) {
            underperformingShops.push({ 
              shop_name: shop.shop_name, 
              total_revenue: shop.total_revenue, 
              projected_revenue: shop.projected_revenue, 
              feasible_goal: shop.feasible_goal, 
              breakthrough_goal: shop.breakthrough_goal, 
              deficit: Math.max(0, (shop.feasible_goal || 0) - shop.projected_revenue) 
            });
          }
          break;
        case "no-color": colorCounts.noColor++; break;
      }
    });

    const pieData = [
      { name: "Đột phá", value: colorCounts.green },
      { name: "Khả thi", value: colorCounts.yellow },
      { name: "Gần đạt", value: colorCounts.red },
      { name: "Chưa đạt", value: colorCounts.purple },
    ].filter(item => item.value > 0);

    return {
      totalShops: total,
      totalEmployees: personnelIds.size,
      personnelBreakthrough: personnelBreakthrough.size,
      personnelFeasible: personnelFeasible.size,
      breakthroughMet: colorCounts.green,
      feasibleOnlyMet: colorCounts.yellow,
      almostMet: colorCounts.red,
      notMet80Percent: colorCounts.purple,
      underperformingShops,
      pieData,
      personnelBreakthroughDetails: Object.values(personnelBreakthroughDetails),
      personnelFeasibleDetails: Object.values(personnelFeasibleDetails),
    };
  }, [monthlyShopTotals]);
};