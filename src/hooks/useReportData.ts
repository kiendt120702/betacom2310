import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { format, subMonths } from "date-fns";
import { useMemo } from "react";

interface UseReportDataProps {
  selectedMonth: string;
}

/**
 * Hook chỉ chuyên fetch data - không có business logic phức tạp
 */
export const useReportData = ({ selectedMonth }: UseReportDataProps) => {
  // Current month reports
  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ 
    month: selectedMonth 
  });

  // All shops data
  const { data: shopsData, isLoading: shopsLoading } = useShops({ 
    page: 1, 
    pageSize: 10000, 
    searchTerm: "", 
    status: "all" 
  });

  // Previous month for comparison
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  const { data: prevMonthReports = [] } = useComprehensiveReports({ 
    month: previousMonth 
  });

  const allShops = shopsData?.shops || [];
  const isLoading = reportsLoading || shopsLoading;

  return {
    reports,
    allShops,
    prevMonthReports,
    isLoading,
    previousMonth
  };
};