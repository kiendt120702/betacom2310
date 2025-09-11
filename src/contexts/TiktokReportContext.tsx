import React, { createContext, useContext } from 'react';
import { useTiktokComprehensiveReportData } from '@/hooks/useTiktokComprehensiveReportData';

interface TiktokReportContextType {
  isLoading: boolean;
  monthlyShopTotals: any[];
  leaders: any[];
  personnelOptions: any[];
}

const TiktokReportContext = createContext<TiktokReportContextType>({
  isLoading: true,
  monthlyShopTotals: [],
  leaders: [],
  personnelOptions: [],
});

interface TiktokReportProviderProps {
  children: React.ReactNode;
  selectedMonth: string;
  selectedLeader: string;
  selectedPersonnel: string;
  debouncedSearchTerm: string;
  sortConfig: { key: 'total_revenue'; direction: 'asc' | 'desc' } | null;
}

/**
 * Optimized TikTok Report Context Provider
 * - Centralizes data fetching to avoid prop drilling
 * - Better performance with React.memo and context splitting
 */
export const TiktokReportProvider: React.FC<TiktokReportProviderProps> = React.memo(({ 
  children, 
  selectedMonth,
  selectedLeader,
  selectedPersonnel,
  debouncedSearchTerm,
  sortConfig
}) => {
  const reportData = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader,
    selectedPersonnel,
    debouncedSearchTerm,
    sortConfig,
  });

  return (
    <TiktokReportContext.Provider value={reportData}>
      {children}
    </TiktokReportContext.Provider>
  );
});

TiktokReportProvider.displayName = 'TiktokReportProvider';

export const useTiktokReportContext = () => {
  const context = useContext(TiktokReportContext);
  if (!context) {
    throw new Error('useTiktokReportContext must be used within a TiktokReportProvider');
  }
  return context;
};