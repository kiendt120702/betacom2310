import { useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { ReportFilters, ShopReportData, SortConfig, ShopStatus } from "@/types/reports";
import { useUserProfile } from "./useUserProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, parseISO, endOfMonth } from "date-fns";
import { Shop } from "./useShops";
import { ComprehensiveReport } from "./useComprehensiveReports";

interface UseComprehensiveReportDataProps {
  filters: ReportFilters;
  sortConfig: SortConfig | null;
}

const getShopColorCategory = (shopData: ShopReportData): string => {
  const projectedRevenue = shopData.projected_revenue || 0;
  const feasibleGoal = shopData.feasible_goal;
  const breakthroughGoal = shopData.breakthrough_goal;

  if (
    feasibleGoal == null ||
    breakthroughGoal == null ||
    projectedRevenue <= 0
  ) {
    return "no-color";
  }

  if (feasibleGoal === 0) {
    return "no-color";
  }

  if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
    return "green";
  } else if (projectedRevenue >= feasibleGoal) {
    return "yellow";
  } else if (
    projectedRevenue >= feasibleGoal * 0.8 &&
    projectedRevenue < feasibleGoal
  ) {
    return "red";
  } else {
    return "purple";
  }
};

export const useComprehensiveReportData = ({
  filters,
  sortConfig,
}: UseComprehensiveReportDataProps) => {
  const { data: userProfile } = useUserProfile();
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const { selectedMonth } = filters;
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  const { data, isLoading } = useQuery({
    queryKey: ['comprehensiveReportData', selectedMonth, previousMonth],
    queryFn: async () => {
      const [shopsResult, reportsResult, prevMonthReportsResult] = await Promise.all([
        supabase.from('shopee_shops').select(`*, profile:sys_profiles!profile_id(*, manager:sys_profiles!manager_id(*))`),
        supabase.from('shopee_comprehensive_reports').select('*').gte('report_date', `${selectedMonth}-01`).lte('report_date', format(endOfMonth(new Date(`${selectedMonth}-02`)), 'yyyy-MM-dd')),
        supabase.from('shopee_comprehensive_reports').select('*').gte('report_date', `${previousMonth}-01`).lte('report_date', format(endOfMonth(new Date(`${previousMonth}-02`)), 'yyyy-MM-dd')),
      ]);

      if (shopsResult.error) throw shopsResult.error;
      if (reportsResult.error) throw reportsResult.error;
      if (prevMonthReportsResult.error) throw prevMonthReportsResult.error;

      return {
        allShops: (shopsResult.data as unknown as Shop[]) || [],
        reports: (reportsResult.data as ComprehensiveReport[]) || [],
        prevMonthReports: (prevMonthReportsResult.data as ComprehensiveReport[]) || [],
      };
    },
  });

  const allShops = data?.allShops || [];
  const reports = data?.reports || [];
  const prevMonthReports = data?.prevMonthReports || [];

  const calculatedData = useMemo(() => {
    if (isLoading) return [];
    const reportsByShop = new Map<string, ComprehensiveReport[]>();
    reports.forEach(r => {
      if (!r.shop_id) return;
      if (!reportsByShop.has(r.shop_id)) reportsByShop.set(r.shop_id, []);
      reportsByShop.get(r.shop_id)!.push(r);
    });

    const prevMonthReportsByShop = new Map<string, ComprehensiveReport[]>();
    prevMonthReports.forEach(r => {
      if (!r.shop_id) return;
      if (!prevMonthReportsByShop.has(r.shop_id)) prevMonthReportsByShop.set(r.shop_id, []);
      prevMonthReportsByShop.get(r.shop_id)!.push(r);
    });

    return allShops.map(shop => {
      const shopReports = reportsByShop.get(shop.id) || [];
      const prevMonthShopReports = prevMonthReportsByShop.get(shop.id) || [];
      
      const totals = shopReports.reduce((acc, r) => {
        acc.total_revenue += r.total_revenue || 0;
        acc.total_cancelled_revenue += r.cancelled_revenue || 0;
        acc.total_returned_revenue += r.returned_revenue || 0;
        return acc;
      }, { total_revenue: 0, total_cancelled_revenue: 0, total_returned_revenue: 0 });

      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      const total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      
      let like_for_like_previous_month_revenue = 0;
      if (lastReport) {
        const lastDay = parseISO(lastReport.report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports
          .filter(r => parseISO(r.report_date).getDate() <= lastDay)
          .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }

      let projected_revenue = 0;
      if (lastReport) {
        const lastDay = parseISO(lastReport.report_date).getDate();
        if (lastDay > 0) {
          const daysInMonth = new Date(new Date(lastReport.report_date).getFullYear(), new Date(lastReport.report_date).getMonth() + 1, 0).getDate();
          const dailyAverage = totals.total_revenue / lastDay;
          projected_revenue = dailyAverage * daysInMonth;
        }
      }

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: (shop.status || 'Chưa có') as ShopStatus,
        personnel_id: shop.profile?.id || null,
        personnel_name: shop.profile?.full_name || shop.profile?.email || "Chưa phân công",
        personnel_account: shop.profile?.email || 'N/A',
        leader_name: shop.profile?.manager?.full_name || shop.profile?.manager?.email || "Chưa có leader",
        ...totals,
        feasible_goal: lastReport?.feasible_goal ?? null,
        breakthrough_goal: lastReport?.breakthrough_goal ?? null,
        projected_revenue,
        report_id: lastReport?.id || null,
        last_report_date: lastReport?.report_date || null,
        total_previous_month_revenue,
        like_for_like_previous_month_revenue,
      };
    });
  }, [allShops, reports, prevMonthReports, isLoading]);

  const { leaders, personnelOptions } = useMemo(() => {
    if (!allShops) return { leaders: [], personnelOptions: [] };
    const leadersMap = new Map<string, { id: string; name: string }>();
    allShops.forEach(shop => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, { id: manager.id, name: manager.full_name || manager.email });
        }
      }
    });
    const leaders = Array.from(leadersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const personnelMap = new Map<string, { id: string; name: string }>();
    let shopsToConsider = allShops;
    if (filters.selectedLeader !== 'all') {
      shopsToConsider = allShops.filter(shop => shop.profile?.manager?.id === filters.selectedLeader);
    }
    shopsToConsider.forEach(shop => {
      if (shop.profile) {
        if (!personnelMap.has(shop.profile.id)) {
          personnelMap.set(shop.profile.id, { id: shop.profile.id, name: shop.profile.full_name || shop.profile.email });
        }
      }
    });
    const personnelOptions = Array.from(personnelMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return { leaders, personnelOptions };
  }, [allShops, filters.selectedLeader]);

  const processedData = useMemo((): ShopReportData[] => {
    if (isLoading || !calculatedData) return [];
    let filtered = calculatedData;

    if (userProfile?.role === "chuyên viên") {
      filtered = filtered.filter(shop => shop.personnel_id === userProfile.id);
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(shop => shop.shop_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }

    if (filters.selectedPersonnel !== "all") {
      filtered = filtered.filter(shop => shop.personnel_id === filters.selectedPersonnel);
    } else if (filters.selectedLeader !== "all") {
      const leaderShops = allShops.filter(shop => shop.profile?.manager?.id === filters.selectedLeader);
      const leaderShopIds = new Set(leaderShops.map(shop => shop.id));
      filtered = filtered.filter(shop => leaderShopIds.has(shop.shop_id));
    }

    if (filters.selectedColorFilter && filters.selectedColorFilter !== "all") {
      filtered = filtered.filter(shop => getShopColorCategory(shop) === filters.selectedColorFilter);
    }

    if (filters.selectedStatusFilter && filters.selectedStatusFilter.length > 0) {
      filtered = filtered.filter(shop => filters.selectedStatusFilter.includes(shop.shop_status));
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      filtered.sort((a, b) => (b.last_report_date || "").localeCompare(a.last_report_date || ""));
    }

    return filtered;
  }, [calculatedData, debouncedSearchTerm, filters, sortConfig, allShops, isLoading, userProfile]);

  return {
    isLoading,
    monthlyShopTotals: processedData,
    leaders,
    personnelOptions,
  };
};