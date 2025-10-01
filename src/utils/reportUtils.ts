import type { ShopReportData } from "@/types/reports";

export type ColorCategory = 'green' | 'yellow' | 'red' | 'purple' | 'no-color';

/**
 * Determines the color category for a shop based on its performance against goals.
 * @param shopData - The performance data for a single shop.
 * @returns The color category as a string.
 */
export const getShopColorCategory = (shopData: Partial<ShopReportData>): ColorCategory => {
  const projectedRevenue = shopData.projected_revenue || 0;
  const feasibleGoal = shopData.feasible_goal;
  const breakthroughGoal = shopData.breakthrough_goal;

  if (projectedRevenue <= 0) {
    return "no-color";
  }

  if (feasibleGoal == null) {
    return "no-color";
  }
  
  if (feasibleGoal === 0) {
    return "no-color";
  }

  if (breakthroughGoal != null && projectedRevenue > breakthroughGoal) {
    return "green";
  }
  if (projectedRevenue >= feasibleGoal) {
    return "yellow";
  }
  if (projectedRevenue >= feasibleGoal * 0.8) {
    return "red";
  }
  return "purple";
};