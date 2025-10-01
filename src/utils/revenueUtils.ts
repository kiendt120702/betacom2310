import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Generate month options including past and future months
 */
export const generateMonthOptions = () => {
  const options = [];
  const now = new Date();

  // Add 4 future months
  for (let i = 4; i >= 1; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: vi }),
    });
  }

  // Add current month and 11 past months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: vi }),
    });
  }
  return options;
};

// formatCurrency moved to @/lib/numberUtils

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: string | Date, formatStr: string = "dd/MM/yyyy") => 
  format(new Date(date), formatStr, { locale: vi });

/**
 * Group revenue data by shop ID
 */
export const groupRevenueByShop = (revenueData: Array<{ shop_id: string; revenue_amount: number }>) =>
  revenueData.reduce((acc, item) => {
    acc[item.shop_id] = (acc[item.shop_id] || 0) + item.revenue_amount;
    return acc;
  }, {} as Record<string, number>);

/**
 * Group revenue data by date
 */
export const groupRevenueByDate = (revenueData: Array<{ revenue_date: string; revenue_amount: number }>) =>
  revenueData.reduce((acc, item) => {
    const date = item.revenue_date;
    acc[date] = (acc[date] || 0) + item.revenue_amount;
    return acc;
  }, {} as Record<string, number>);

/**
 * Calculate revenue statistics
 */
export const calculateRevenueStats = (amounts: number[]) => {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const count = amounts.length;
  const average = count > 0 ? total / count : 0;
  
  return { total, average, count };
};

/**
 * Sort data by revenue amount in descending order
 */
export const sortByRevenue = <T extends { total_revenue: number }>(data: T[]) =>
  data.sort((a, b) => b.total_revenue - a.total_revenue);