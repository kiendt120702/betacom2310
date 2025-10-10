import React, { createContext, useContext, useMemo, useState } from 'react';
import { useComprehensiveReportData } from '@/hooks/useComprehensiveReportData';
import { useUpdateComprehensiveReport } from '@/hooks/useComprehensiveReports';
import { useReportFilters } from '@/hooks/useReportFilters';
import { generateMonthOptions } from '@/utils/revenueUtils';
import type { ShopReportData, ReportFilters, Employee, MonthOption } from '@/types/reports';
import { Shop } from '@/hooks/useShops';

interface GoalSettingContextType {
  isLoading: boolean;
  monthlyShopTotals: ShopReportData[];
  leaders: Employee[];
  personnelOptions: Employee[];
  monthOptions: MonthOption[];
  filters: ReportFilters;
  updateFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
  openStates: {
    openLeaderSelector: boolean;
    openPersonnelSelector: boolean;
  };
  setOpenLeaderSelector: (open: boolean) => void;
  setOpenPersonnelSelector: (open: boolean) => void;
  updateReportMutation: ReturnType<typeof useUpdateComprehensiveReport>;
  isShopDialogOpen: boolean;
  setIsShopDialogOpen: (isOpen: boolean) => void;
  editingShop: Shop | null;
  setEditingShop: (shop: Shop | null) => void;
}

const GoalSettingContext = createContext<GoalSettingContextType | undefined>(undefined);

export const GoalSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const filterHook = useReportFilters();
  const { filters } = filterHook;
  
  const dataHook = useComprehensiveReportData({
    filters,
    sortConfig: null,
  });

  const updateReportMutation = useUpdateComprehensiveReport();
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const contextValue = useMemo((): GoalSettingContextType => ({
    isLoading: dataHook.isLoading,
    monthlyShopTotals: dataHook.monthlyShopTotals,
    leaders: dataHook.leaders,
    personnelOptions: dataHook.personnelOptions,
    monthOptions,
    filters,
    updateFilter: filterHook.updateFilter,
    openStates: filterHook.openStates,
    setOpenLeaderSelector: filterHook.setOpenLeaderSelector,
    setOpenPersonnelSelector: filterHook.setOpenPersonnelSelector,
    updateReportMutation,
    isShopDialogOpen,
    setIsShopDialogOpen,
    editingShop,
    setEditingShop,
  }), [dataHook, filterHook, monthOptions, updateReportMutation, isShopDialogOpen, editingShop]);

  return (
    <GoalSettingContext.Provider value={contextValue}>
      {children}
    </GoalSettingContext.Provider>
  );
};

export const useGoalSettingContext = (): GoalSettingContextType => {
  const context = useContext(GoalSettingContext);
  if (!context) {
    throw new Error('useGoalSettingContext must be used within a GoalSettingProvider');
  }
  return context;
};