import { useMemo } from "react";
import { useComprehensiveReports, ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
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
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "", status: "Đang Vận Hành" });
  const allShops = shopsData?.shops || [];


  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const isLoading = reportsLoading || shopsLoading;

  const leaders = useMemo(() => {
    if (!allShops.length) return [];
    
    const leadersMap = new Map();
    allShops.forEach(shop => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, {
            id: manager.id,
            name: manager.full_name || manager.email,
          });
        }
      }
    });
    
    return Array.from(leadersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops]);

  const personnelOptions = useMemo(() => {
    if (!allShops.length) return [];
    
    const personnelMap = new Map();
    let shopsToConsider = allShops;

    if (selectedLeader !== 'all') {
      shopsToConsider = allShops.filter(shop => shop.profile?.manager?.id === selectedLeader);
    }

    shopsToConsider.forEach(shop => {
      if (shop.profile) {
        const personnel = shop.profile;
        if (!personnelMap.has(personnel.id)) {
          personnelMap.set(personnel.id, {
            id: personnel.id,
            name: personnel.full_name || personnel.email,
          });
        }
      }
    });
    
    return Array.from(personnelMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [allShops, selectedLeader]);

  const monthlyShopTotals = useMemo(() => {
    if (isLoading) return [];

    let filteredShops = allShops;

    if (debouncedSearchTerm) {
      filteredShops = filteredShops.filter(shop =>
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    if (selectedPersonnel !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.profile?.id === selectedPersonnel);
    } else if (selectedLeader !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.profile?.manager?.id === selectedLeader);
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

      // Calculate total revenue by summing ALL report entries for this shop in the month
      const total_revenue = shopReports.reduce((sum, r) => {
        const revenue = r.total_revenue || 0;
        return sum + revenue;
      }, 0);

      const total_cancelled_revenue = shopReports.reduce((sum, r) => sum + (r.cancelled_revenue || 0), 0);
      const total_returned_revenue = shopReports.reduce((sum, r) => sum + (r.returned_revenue || 0), 0);
      
      // Find goals from any report in the month (prioritize latest with goals, but fallback to any report)
      const sortedReports = shopReports.sort((a: ComprehensiveReport, b: ComprehensiveReport) => 
        new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
      );
      
      // First, try to find the latest report with any goal data
      const latestReportWithGoals = sortedReports.find(r => r.feasible_goal != null || r.breakthrough_goal != null);
      
      // If no report has goals, check the latest report for potential goal fields
      const latestReport = sortedReports[0];
      
      // Use goals from the report that has them, or from the latest report
      const reportWithGoals = latestReportWithGoals || latestReport;
      const feasible_goal = reportWithGoals?.feasible_goal;
      const breakthrough_goal = reportWithGoals?.breakthrough_goal;
      
      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      const report_id = lastReport?.id;
      const last_report_date = lastReport?.report_date;

      const total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

      let like_for_like_previous_month_revenue = 0;
      if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports.filter(r => parseISO(r.report_date).getDate() <= lastDay).reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }
      
      const growth = like_for_like_previous_month_revenue > 0 ? (total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue : total_revenue > 0 ? Infinity : 0;

      let projected_revenue = 0;
      if (total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
        projected_revenue = total_previous_month_revenue * (1 + growth);
      } else if (last_report_date) {
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

      const personnelName = shop.profile?.full_name || 'Chưa có tên';
      const leaderName = shop.profile?.manager?.full_name || 'Chưa có tên';

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: shop.status,
        personnel_name: personnelName,
        personnel_account: shop.profile?.email || 'N/A',
        leader_name: leaderName,
        total_revenue,
        total_cancelled_revenue,
        total_returned_revenue,
        feasible_goal,
        breakthrough_goal,
        report_id,
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
  }, [allShops, reports, prevMonthReports, isLoading, selectedLeader, selectedPersonnel, sortConfig, debouncedSearchTerm, selectedMonth]);

  return {
    isLoading,
    monthlyShopTotals,
    leaders,
    personnelOptions,
  };
};