import { useMemo } from "react";
import { useComprehensiveReports, ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { format, subMonths, parseISO } from "date-fns";

interface UseComprehensiveReportDataProps {
  selectedMonth: string;
  selectedLeader: string;
  selectedPersonnel: string;
  debouncedSearchTerm: string;
  sortConfig: { key: 'total_revenue'; direction: 'asc' | 'desc' } | null;
}

export const useComprehensiveReportData = ({
  selectedMonth,
  selectedLeader,
  selectedPersonnel,
  debouncedSearchTerm,
  sortConfig,
}: UseComprehensiveReportDataProps) => {
  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "" });
  const allShops = shopsData?.shops || [];
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 1000 });

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const isLoading = reportsLoading || shopsLoading || employeesLoading;

  const monthlyShopTotals = useMemo(() => {
    if (isLoading) return [];

    let filteredShops = allShops;

    if (debouncedSearchTerm) {
      filteredShops = filteredShops.filter(shop =>
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    if (selectedPersonnel !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.personnel_id === selectedPersonnel);
    } else if (selectedLeader !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.leader_id === selectedLeader);
    }

    const reportsMap = new Map<string, any[]>();
    reports.forEach(report => {
      if (!report.shop_id) return;
      if (!reportsMap.has(report.shop_id)) reportsMap.set(report.shop_id, []);
      reportsMap.get(report.shop_id)!.push(report);
    });

    const prevMonthReportsMap = new Map<string, any[]>();
    prevMonthReports.forEach(report => {
      if (!report.shop_id) return;
      if (!prevMonthReportsMap.has(report.shop_id)) prevMonthReportsMap.set(report.shop_id, []);
      prevMonthReportsMap.get(report.shop_id)!.push(report);
    });

    const mappedData = filteredShops.map(shop => {
      const shopReports = reportsMap.get(shop.id) || [];
      const prevMonthShopReports = prevMonthReportsMap.get(shop.id) || [];

      const total_revenue = shopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      const total_cancelled_revenue = shopReports.reduce((sum, r) => sum + (r.cancelled_revenue || 0), 0);
      const total_returned_revenue = shopReports.reduce((sum, r) => sum + (r.returned_revenue || 0), 0);
      
      const lastReportWithFeasibleGoal = shopReports.filter((r: ComprehensiveReport) => r.feasible_goal != null).sort((a: ComprehensiveReport, b: ComprehensiveReport) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      const lastReportWithBreakthroughGoal = shopReports.filter((r: ComprehensiveReport) => r.breakthrough_goal != null).sort((a: ComprehensiveReport, b: ComprehensiveReport) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];

      const feasible_goal = lastReportWithFeasibleGoal?.feasible_goal;
      const breakthrough_goal = lastReportWithBreakthroughGoal?.breakthrough_goal;
      
      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      const last_report_date = lastReport?.report_date;

      const total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

      let like_for_like_previous_month_revenue = 0;
      if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports.filter(r => parseISO(r.report_date).getDate() <= lastDay).reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }
      
      const growth = like_for_like_previous_month_revenue > 0 ? (total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue : total_revenue > 0 ? Infinity : 0;

      let projected_revenue = 0;
      if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        if (lastDay > 0) {
          const dailyAverage = total_revenue / lastDay;
          const daysInMonth = new Date(new Date(last_report_date).getFullYear(), new Date(last_report_date).getMonth() + 1, 0).getDate();
          projected_revenue = dailyAverage * daysInMonth;
        } else {
          projected_revenue = total_revenue;
        }
      } else {
        projected_revenue = total_revenue;
      }

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: shop.status,
        personnel_name: shop.personnel?.name || 'N/A',
        leader_name: shop.leader?.name || 'N/A',
        total_revenue,
        total_cancelled_revenue,
        total_returned_revenue,
        feasible_goal,
        breakthrough_goal,
        last_report_date,
        total_previous_month_revenue,
        like_for_like_previous_month_revenue,
        projected_revenue,
      };
    });

    let sortedData = [...mappedData];
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
  }, [allShops, reports, prevMonthReports, isLoading, selectedLeader, selectedPersonnel, sortConfig, employeesData, debouncedSearchTerm]);

  return {
    isLoading,
    monthlyShopTotals,
    leaders: useMemo(() => employeesData?.employees.filter(e => e.role === 'leader') || [], [employeesData]),
    personnelOptions: useMemo(() => {
      if (!employeesData?.employees) return [];
      const allEmployees = employeesData.employees;
      if (selectedLeader === 'all') return allEmployees.filter(e => e.role === 'personnel' || e.role === 'leader');
      const leader = allEmployees.find(e => e.id === selectedLeader);
      const personnel = allEmployees.filter(e => e.role === 'personnel' && e.leader_id === selectedLeader);
      return leader ? [leader, ...personnel] : personnel;
    }, [employeesData, selectedLeader]),
  };
};