import { useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useReportData } from "@/hooks/useReportData";
import { useReportCalculations } from "@/hooks/useReportCalculations";
import { useReportPersonnel } from "@/hooks/useReportPersonnel";
import type { ReportFilters, ShopReportData, SortConfig } from "@/types/reports";
import { getShopColorCategory } from "@/utils/reportUtils";

interface UseComprehensiveReportDataRefactoredProps {
  filters: ReportFilters;
  sortConfig: SortConfig | null;
}

/**
 * Main hook - refactored để sử dụng các hook nhỏ hơn
 * Chỉ còn orchestration logic, không có heavy business logic
 */
export const useComprehensiveReportDataRefactored = ({
  filters,
  sortConfig,
}: UseComprehensiveReportDataRefactoredProps) => {
  
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
    if (isLoading || !calculatedData.length) return [];

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
    } else if (filters.selectedLeader !== 'all') {
      // If no specific personnel, filter by leader
      const leaderShops = allShops.filter(shop => 
        shop.profile?.manager?.id === filters.selectedLeader
      );
      const leaderShopIds = new Set(leaderShops.map(shop => shop.id));
      filtered = filtered.filter(shop => leaderShopIds.has(shop.shop_id));
    }

    // Apply color filter
    if (filters.selectedColorFilter !== 'all') {
      filtered = filtered.filter((shop) => {
        const colorCategory = getShopColorCategory(shop);
        return colorCategory === filters.selectedColorFilter;
      });
    }

    // Apply status filter (multi-select)
    if (filters.selectedStatusFilter.length > 0) {
      filtered = filtered.filter((shop) => {
        return filters.selectedStatusFilter.includes(shop.shop_status);
      });
    }

    // Clone array before sorting to prevent mutation
    let sortedData = [...filtered];

    // Apply sorting
    if (sortConfig) {
      sortedData.sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by last_report_date descending
      sortedData.sort((a, b) => {
        const dateA = a.last_report_date ? new Date(a.last_report_date).getTime() : 0;
        const dateB = b.last_report_date ? new Date(b.last_report_date).getTime() : 0;
        return dateB - dateA;
      });
    }

    return sortedData;
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