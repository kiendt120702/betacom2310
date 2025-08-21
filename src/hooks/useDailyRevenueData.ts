import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComprehensiveReport } from "./useComprehensiveReports";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const fetchAllReportsForMonth = async (month: string, shopId: string): Promise<ComprehensiveReport[]> => {
    if (!month || !shopId || shopId === 'all') return [];

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, monthNum - 1));
    const endDate = endOfMonth(startDate);

    let allReports: ComprehensiveReport[] = [];
    const pageSize = 1000;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from("comprehensive_reports")
            .select(`*`)
            .eq("shop_id", shopId)
            .gte("report_date", format(startDate, "yyyy-MM-dd"))
            .lte("report_date", format(endDate, "yyyy-MM-dd"))
            .range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching paginated daily reports:", error);
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

const createCompleteDailyData = (reports: ComprehensiveReport[], month: string, shopId: string): ComprehensiveReport[] => {
    const [year, monthNum] = month.split('-').map(Number);
    const start = startOfMonth(new Date(year, monthNum - 1));
    const end = endOfMonth(start);
    const allDaysInMonth = eachDayOfInterval({ start, end });

    const reportsByDate = new Map(
        reports.map(r => [format(new Date(r.report_date.replace(/-/g, "/")), "yyyy-MM-dd"), r])
    );

    return allDaysInMonth.map(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        const report = reportsByDate.get(dateString);

        if (report) {
            return report;
        }

        return {
            id: dateString,
            report_date: dateString,
            total_revenue: 0,
            total_orders: 0,
            average_order_value: 0,
            shop_id: shopId,
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
    }).sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
};

export const useDailyRevenueData = (month: string, shopId: string) => {
    return useQuery({
        queryKey: ["dailyRevenueData", month, shopId],
        queryFn: async () => {
            if (!month || !shopId || shopId === 'all') return [];
            const rawReports = await fetchAllReportsForMonth(month, shopId);
            return createCompleteDailyData(rawReports, month, shopId);
        },
        enabled: !!month && !!shopId && shopId !== 'all',
    });
};