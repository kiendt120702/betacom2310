import { useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useReportData } from "@/hooks/useReportData";
import { useReportCalculations } from "@/hooks/useReportCalculations";
import { useReportPersonnel } from "@/hooks/useReportPersonnel";
import type { ReportFilters, ShopReportData, SortConfig } from "@/types/reports";

interface UseComprehensiveReportDataProps {
  filters: ReportFilters;
  sortConfig: SortConfig | null;
}

/**
 * Main hook - refactored để sử dụng các hook nhỏ hơn
 * Chỉ còn orchestration logic, không có heavy business logic
 */
export const useComprehensiveReportData = ({
  filters,
  sortConfig,
}: UseComprehensiveReportDataProps) => {
  
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // 1. Fetch raw data
  const { reports, allShops, prevMonthReports, isLoading } = useReportData({
    selectedMonth: filters.selectedMonth
  });

  // 2. Process calculations with optimized performance
  const calculatedData = useReportCalculations(
    allShops, 
    reports, 
    prevMonthReports, 
    isLoading
  );

  // 3. Get personnel and leaders data
  const { leaders, personnelOptions } = useReportPersonnel(
    allShops, 
    filters.selectedLeader
  );

  // 4. Apply filters and sorting with memoization
  const processedData = useMemo((): ShopReportData[] => {
    if (isLoading || !calculatedData || !calculatedData.length) return [];

    let filtered = calculatedData;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.shop_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply personnel filter
    if (filters.selectedPersonnel !== 'all') {
      filtered = filtered.filter(shop => 
        shop.personnel_id === filters.selectedPersonnel
      );
    } else if (filters.selectedLeader !== 'all' && allShops) {
      // If no specific personnel, filter by leader
      const leaderShops = allShops.filter(shop => 
        shop.profile?.manager?.id === filters.selectedLeader
      );
      const leaderShopIds = new Set(leaderShops.map(shop => shop.id));
      filtered = filtered.filter(shop => leaderShopIds.has(shop.shop_id));
    }

    // Apply color filter
    if (filters.selectedColorFilter && filters.selectedColorFilter !== 'all') {
      filtered = filtered.filter((shop) => {
        const colorCategory = getShopColorCategory(shop);
        return colorCategory === filters.selectedColorFilter;
      });
    }

    // Apply status filter (multi-select)
    if (filters.selectedStatusFilter && filters.selectedStatusFilter.length > 0) {
      filtered = filtered.filter((shop) => {
        return filters.selectedStatusFilter.includes(shop.shop_status);
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by last_report_date descending
      filtered.sort((a, b) => {
        const dateA = a.last_report_date ? new Date(a.last_report_date).getTime() : 0;
        const dateB = b.last_report_date ? new Date(b.last_report_date).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [
    calculatedData, 
    debouncedSearchTerm, 
    filters.selectedPersonnel, 
    filters.selectedLeader,
    filters.selectedColorFilter,
    filters.selectedStatusFilter,
    sortConfig, 
    allShops,
    isLoading
  ]);

  return {
    isLoading,
    monthlyShopTotals: processedData,
    leaders,
    personnelOptions,
  };
};

// Helper function - will be moved to utils later
function getShopColorCategory(shopData: ShopReportData): string {
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
}