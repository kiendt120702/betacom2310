import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import type { ReportFilters, Employee, SortConfig } from "@/types/reports";

interface UseReportFiltersReturn {
  filters: ReportFilters;
  sortConfig: SortConfig | null;
  openStates: {
    openLeaderSelector: boolean;
    openPersonnelSelector: boolean;
  };
  updateFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
  setSortConfig: (config: SortConfig | null) => void;
  setOpenLeaderSelector: (open: boolean) => void;
  setOpenPersonnelSelector: (open: boolean) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}

const initialFilters: ReportFilters = {
  selectedMonth: format(new Date(), "yyyy-MM"),
  selectedLeader: "all",
  selectedPersonnel: "all", 
  searchTerm: "",
  selectedColorFilter: "all",
  selectedStatusFilter: ["Đang Vận Hành", "Shop mới"]
};

/**
 * Hook chuyên quản lý filter state - centralized filter management
 */
export const useReportFilters = (): UseReportFiltersReturn => {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // UI state for dropdowns
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);

  // Memoized update function to prevent re-renders
  const updateFilter = useCallback(<K extends keyof ReportFilters>(
    key: K, 
    value: ReportFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSortConfig(null);
  }, []);

  // Count active filters for UI badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedLeader !== 'all') count++;
    if (filters.selectedPersonnel !== 'all') count++;
    if (filters.selectedColorFilter !== 'all') count++;
    if (filters.selectedStatusFilter.length > 0) count++;
    if (filters.searchTerm.trim()) count++;
    return count;
  }, [filters]);

  return {
    filters,
    sortConfig,
    openStates: {
      openLeaderSelector,
      openPersonnelSelector
    },
    updateFilter,
    setSortConfig,
    setOpenLeaderSelector,
    setOpenPersonnelSelector,
    clearFilters,
    activeFiltersCount
  };
};