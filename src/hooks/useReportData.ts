import { useComprehensiveReports, fetchAllReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { format, subMonths } from "date-fns";
import { useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface UseReportDataProps {
  selectedMonth: string;
}

/**
 * Hook chỉ chuyên fetch data - không có business logic phức tạp
 * Với prefetching optimization cho tháng trước
 */
export const useReportData = ({ selectedMonth }: UseReportDataProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Current month reports
  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ 
    month: selectedMonth 
  });

  // All shops data - reduced pageSize for faster loading
  const { data: shopsData, isLoading: shopsLoading } = useShops({ 
    page: 1, 
    pageSize: 5000, // Reduced from 10000 
    searchTerm: "", 
    status: "all" 
  });

  // Previous month for comparison
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  // Prefetch next few months when current month loads
  useEffect(() => {
    if (selectedMonth && user) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const currentDate = new Date(year, month - 1, 1);
      
      // Prefetch next 2 months
      [1, 2].forEach(offset => {
        const futureDate = new Date(year, month - 1 + offset, 1);
        const futureMonth = format(futureDate, "yyyy-MM");
        
        queryClient.prefetchQuery({
          queryKey: ["shopee_comprehensive_reports", { month: futureMonth }, user.id],
          queryFn: () => fetchAllReports({ month: futureMonth }),
          staleTime: 15 * 60 * 1000,
        });
      });

      // Prefetch previous month if not already loading
      if (previousMonth !== selectedMonth) {
        queryClient.prefetchQuery({
          queryKey: ["shopee_comprehensive_reports", { month: previousMonth }, user.id],
          queryFn: () => fetchAllReports({ month: previousMonth }),
          staleTime: 15 * 60 * 1000,
        });
      }
    }
  }, [selectedMonth, user, previousMonth, queryClient]);

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