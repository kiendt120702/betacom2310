import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useComprehensiveReportDataRefactored } from '@/hooks/useComprehensiveReportDataRefactored';
import { useReportFilters } from '@/hooks/useReportFilters';
import { generateMonthOptions } from '@/utils/revenueUtils';
import type { 
  ShopReportData, 
  ShopStatus, 
  ReportFilters, 
  SortConfig, 
  Employee, 
  MonthOption,
  ReportStatistics 
} from '@/types/reports';
import { getShopColorCategory, ColorCategory } from '@/utils/reportUtils';

// Context type definition
interface ReportContextType {
  // Data
  data: ShopReportData[];
  statistics: ReportStatistics;
  isLoading: boolean;
  
  // Filters
  filters: ReportFilters;
  updateFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  
  // Sorting
  sortConfig: SortConfig | null;
  requestSort: (key: 'total_revenue') => void;
  
  // Options
  leaders: Employee[];
  personnelOptions: Employee[];
  monthOptions: MonthOption[];
  
  // UI State
  openStates: {
    openLeaderSelector: boolean;
    openPersonnelSelector: boolean;
  };
  setOpenLeaderSelector: (open: boolean) => void;
  setOpenPersonnelSelector: (open: boolean) => void;
  
  // Utility Functions
  getShopStatus: (shopData: ShopReportData) => ShopStatus;
  getShopColorCategory: (shopData: ShopReportData) => ColorCategory;
}

// Create context
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Context Provider Component
export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our refactored hooks
  const filterHook = useReportFilters();
  const dataHook = useComprehensiveReportDataRefactored({
    filters: filterHook.filters,
    sortConfig: filterHook.sortConfig,
  });

  // Memoized utility functions - stable references
  const getShopStatus = useCallback((shopData: ShopReportData): ShopStatus => {
    return shopData.shop_status || 'Chưa có';
  }, []);

  // Memoized sort function
  const requestSort = useCallback((key: 'total_revenue') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      filterHook.sortConfig &&
      filterHook.sortConfig.key === key &&
      filterHook.sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    } else if (
      filterHook.sortConfig &&
      filterHook.sortConfig.key === key &&
      filterHook.sortConfig.direction === 'desc'
    ) {
      filterHook.setSortConfig(null);
      return;
    }
    filterHook.setSortConfig({ key, direction });
  }, [filterHook.sortConfig, filterHook.setSortConfig]);

  // Calculate statistics with memoization
  const statistics = useMemo((): ReportStatistics => {
    const total = dataHook.monthlyShopTotals.length;
    const colorCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      noColor: 0,
    };
    
    const statusCounts = {
      'Đang Vận Hành': 0,
      'Shop mới': 0,
      'Đã Dừng': 0,
    };

    dataHook.monthlyShopTotals.forEach((shop) => {
      // Count by color category
      const category = getShopColorCategory(shop);
      switch (category) {
        case 'green':
          colorCounts.green++;
          break;
        case 'yellow':
          colorCounts.yellow++;
          break;
        case 'red':
          colorCounts.red++;
          break;
        case 'purple':
          colorCounts.purple++;
          break;
        case 'no-color':
          colorCounts.noColor++;
          break;
      }
      
      // Count by status
      const status = getShopStatus(shop);
      switch (status) {
        case 'Đang Vận Hành':
          statusCounts['Đang Vận Hành']++;
          break;
        case 'Shop mới':
          statusCounts['Shop mới']++;
          break;
        case 'Đã Dừng':
          statusCounts['Đã Dừng']++;
          break;
      }
    });

    return {
      total,
      ...colorCounts,
      ...statusCounts,
    };
  }, [dataHook.monthlyShopTotals, getShopStatus]);

  // Memoized month options
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo((): ReportContextType => ({
    // Data
    data: dataHook.monthlyShopTotals,
    statistics,
    isLoading: dataHook.isLoading,
    
    // Filters
    filters: filterHook.filters,
    updateFilter: filterHook.updateFilter,
    clearFilters: filterHook.clearFilters,
    activeFiltersCount: filterHook.activeFiltersCount,
    
    // Sorting
    sortConfig: filterHook.sortConfig,
    requestSort,
    
    // Options
    leaders: dataHook.leaders,
    personnelOptions: dataHook.personnelOptions,
    monthOptions,
    
    // UI State
    openStates: filterHook.openStates,
    setOpenLeaderSelector: filterHook.setOpenLeaderSelector,
    setOpenPersonnelSelector: filterHook.setOpenPersonnelSelector,
    
    // Utilities
    getShopStatus,
    getShopColorCategory,
  }), [
    dataHook,
    filterHook,
    statistics,
    monthOptions,
    requestSort,
    getShopStatus,
  ]);

  return (
    <ReportContext.Provider value={contextValue}>
      {children}
    </ReportContext.Provider>
  );
};

// Custom hook to use the context
export const useReportContext = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};

// HOC for components that need report context
export const withReportContext = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.memo((props: P) => (
    <ReportProvider>
      <Component {...props} />
    </ReportProvider>
  ));
};