
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export type ComprehensiveReport = Tables<'comprehensive_reports'> & {
  shops: {
    name: string;
    team_id: string | null;
    leader_id: string | null;
    personnel: { name: string } | null;
    leader: { name: string } | null;
  } | null;
};

const fetchAllReportsForMonth = async (filters: { month?: string, shopId?: string }): Promise<ComprehensiveReport[]> => {
  if (!filters.month) return [];

  const [year, month] = filters.month.split('-');
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
  const firstDayNextMonth = new Date(Date.UTC(nextYear, nextMonth - 1, 1));
  const lastDayOfMonth = new Date(firstDayNextMonth.getTime() - 24 * 60 * 60 * 1000);
  const endDate = lastDayOfMonth.toISOString().split('T')[0];

  let allReports: ComprehensiveReport[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("comprehensive_reports")
      .select(`
        *,
        shops (
          name,
          team_id,
          leader_id,
          personnel:employees!shops_personnel_id_fkey(name),
          leader:employees!shops_leader_id_fkey(name)
        )
      `)
      .gte('report_date', startDate)
      .lte('report_date', endDate)
      .range(from, to);

    if (filters.shopId) {
      query = query.eq('shop_id', filters.shopId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching paginated reports:", error);
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      allReports = allReports.concat(data as unknown as ComprehensiveReport[]);
      page++;
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allReports;
};

export const useDailyRevenueData = (filters: { month?: string, shopId?: string }) => {
  return useQuery<ComprehensiveReport[]>({
    queryKey: ["dailyRevenueData", filters],
    queryFn: () => fetchAllReportsForMonth(filters),
    enabled: !!filters.month,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Helper function to create complete daily data with all days of the month
export const createCompleteDailyData = (
  reports: ComprehensiveReport[],
  selectedMonth: string,
  selectedShop?: string
) => {
  if (!selectedMonth) return [];

  const [year, month] = selectedMonth.split('-').map(Number);
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const allDaysInMonth = eachDayOfInterval({ start, end });

  // Create a map of existing reports by date
  const reportsByDate = new Map(
    reports.map(r => [r.report_date, r])
  );

  // Create complete daily data for all days in month
  return allDaysInMonth.map(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    const report = reportsByDate.get(dateString);
    
    if (report) {
      return report;
    }
    
    // Create placeholder for days with no data
    return {
      id: dateString,
      report_date: dateString,
      total_revenue: 0,
      total_orders: 0,
      average_order_value: 0,
      shop_id: selectedShop || '',
      shops: null,
      buyer_return_rate: null,
      cancelled_orders: null,
      cancelled_revenue: null,
      conversion_rate: null,
      created_at: day.toISOString(),
      existing_buyers: null,
      feasible_goal: null,
      breakthrough_goal: null,
      new_buyers: null,
      potential_buyers: null,
      product_clicks: null,
      returned_orders: null,
      returned_revenue: null,
      total_buyers: null,
      total_visits: null,
      updated_at: day.toISOString(),
    } as ComprehensiveReport;
  }).sort((a, b) => a.report_date.localeCompare(b.report_date));
};
