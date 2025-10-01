import { useMemo } from "react";
import { parseISO } from "date-fns";
import type { ShopReportData, RevenueCalculation } from "@/types/reports";
import type { ComprehensiveReport } from "@/hooks/useComprehensiveReports";

/**
 * Hook chuyên xử lý calculations - optimized với single-pass operations
 */
export const useReportCalculations = (
  shops: any[],
  reports: ComprehensiveReport[],
  prevMonthReports: ComprehensiveReport[],
  isLoading: boolean
): ShopReportData[] => {
  
  return useMemo(() => {
    if (isLoading || !shops.length) return [];

    // Create maps for O(1) lookup instead of O(n) filtering
    const reportsMap = new Map<string, ComprehensiveReport[]>();
    const prevMonthReportsMap = new Map<string, ComprehensiveReport[]>();

    // Single pass to build maps
    reports.forEach(report => {
      if (!report.shop_id) return;
      if (!reportsMap.has(report.shop_id)) {
        reportsMap.set(report.shop_id, []);
      }
      reportsMap.get(report.shop_id)!.push(report);
    });

    prevMonthReports.forEach(report => {
      if (!report.shop_id) return;
      if (!prevMonthReportsMap.has(report.shop_id)) {
        prevMonthReportsMap.set(report.shop_id, []);
      }
      prevMonthReportsMap.get(report.shop_id)!.push(report);
    });

    // Process each shop individually, removing the problematic grouping by name
    return shops.map(shop => {
      const shopReports = reportsMap.get(shop.id) || [];
      const prevMonthShopReports = prevMonthReportsMap.get(shop.id) || [];

      // Single-pass revenue calculations
      const revenueData = shopReports.reduce<RevenueCalculation>((acc, report) => ({
        total_revenue: acc.total_revenue + (report.total_revenue || 0),
        total_cancelled_revenue: acc.total_cancelled_revenue + (report.cancelled_revenue || 0),
        total_returned_revenue: acc.total_returned_revenue + (report.returned_revenue || 0),
        projected_revenue: 0 // Will be calculated separately
      }), {
        total_revenue: 0,
        total_cancelled_revenue: 0,
        total_returned_revenue: 0,
        projected_revenue: 0
      });

      // Find latest report with goals
      const sortedReports = shopReports.length > 1 
        ? [...shopReports].sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
        : shopReports;

      const latestReportWithGoals = sortedReports.find(r => 
        r.feasible_goal != null || r.breakthrough_goal != null
      );
      
      const reportWithGoals = latestReportWithGoals || sortedReports[0];
      const lastReport = sortedReports[0];

      // Previous month calculations
      const total_previous_month_revenue = prevMonthShopReports.reduce(
        (sum, r) => sum + (r.total_revenue || 0), 0
      );

      // Like-for-like calculation
      let like_for_like_previous_month_revenue = 0;
      if (lastReport?.report_date) {
        const lastDay = parseISO(lastReport.report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports
          .filter(r => parseISO(r.report_date).getDate() <= lastDay)
          .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }

      // Growth and projection calculations
      let projected_revenue = 0;
      if (lastReport?.report_date) {
        const lastDay = parseISO(lastReport.report_date).getDate();
        const daysInMonth = new Date(
          new Date(lastReport.report_date).getFullYear(), 
          new Date(lastReport.report_date).getMonth() + 1, 
          0
        ).getDate();
        
        // If it's not the end of the month, project based on daily average
        if (lastDay < daysInMonth && lastDay > 0) {
          const dailyAverage = revenueData.total_revenue / lastDay;
          projected_revenue = dailyAverage * daysInMonth;
        } else {
          // If it's the end of the month, the projected revenue is the total revenue
          projected_revenue = revenueData.total_revenue;
        }
      } else {
        // If no reports, projected is the same as total (which is 0)
        projected_revenue = revenueData.total_revenue;
      }

      // Return strongly typed data
      const result: ShopReportData = {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: shop.status || 'Chưa có',
        personnel_id: shop.profile?.id || null,
        personnel_name: shop.profile?.full_name || shop.profile?.email || 'Chưa phân công',
        personnel_account: shop.profile?.email || 'N/A',
        leader_name: shop.profile?.manager?.full_name || shop.profile?.manager?.email || 'Chưa có leader',
        total_revenue: revenueData.total_revenue,
        total_cancelled_revenue: revenueData.total_cancelled_revenue,
        total_returned_revenue: revenueData.total_returned_revenue,
        feasible_goal: reportWithGoals?.feasible_goal || null,
        breakthrough_goal: reportWithGoals?.breakthrough_goal || null,
        report_id: lastReport?.id || null,
        last_report_date: lastReport?.report_date || null,
        total_previous_month_revenue,
        like_for_like_previous_month_revenue,
        projected_revenue
      };

      return result;
    });
  }, [shops, reports, prevMonthReports, isLoading]);
};