import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComprehensiveReport } from "./useComprehensiveReports";
import { startOfDay, endOfDay } from "date-fns";

interface SalesAnalyticsParams {
  startDate?: Date;
  endDate?: Date;
  shopId?: string | "all";
}

export const useSalesAnalytics = ({ startDate, endDate, shopId }: SalesAnalyticsParams) => {
  return useQuery({
    queryKey: ["salesAnalytics", startDate, endDate, shopId],
    queryFn: async () => {
      if (!startDate || !endDate) {
        return null;
      }

      let query = supabase
        .from("comprehensive_reports")
        .select("*")
        .gte("report_date", startOfDay(startDate).toISOString())
        .lte("report_date", endOfDay(endDate).toISOString());

      if (shopId && shopId !== "all") {
        query = query.eq("shop_id", shopId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reports = data as ComprehensiveReport[];

      // Process data for KPIs
      const kpis = reports.reduce(
        (acc, report) => {
          acc.totalRevenue += report.total_revenue || 0;
          acc.totalOrders += report.total_orders || 0;
          acc.totalVisits += report.total_visits || 0;
          acc.totalProductClicks += report.product_clicks || 0;
          return acc;
        },
        {
          totalRevenue: 0,
          totalOrders: 0,
          totalVisits: 0,
          totalProductClicks: 0,
        }
      );

      const averageOrderValue = kpis.totalOrders > 0 ? kpis.totalRevenue / kpis.totalOrders : 0;
      const conversionRate = kpis.totalVisits > 0 ? (kpis.totalOrders / kpis.totalVisits) * 100 : 0;

      // Process data for chart
      const chartData = reports.reduce((acc, report) => {
        const date = report.report_date.split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, revenue: 0 };
        }
        acc[date].revenue += report.total_revenue || 0;
        return acc;
      }, {} as Record<string, { date: string; revenue: number }>);

      const sortedChartData = Object.values(chartData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        kpis: { ...kpis, averageOrderValue, conversionRate },
        chartData: sortedChartData,
        reports,
      };
    },
    enabled: !!startDate && !!endDate,
  });
};