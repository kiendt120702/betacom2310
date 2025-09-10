import { useMemo } from "react";
import { useTiktokComprehensiveReports, TiktokComprehensiveReport } from "@/hooks/useTiktokComprehensiveReports";
import { format, subMonths, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface UseTiktokComprehensiveReportDataProps {
  selectedMonth: string;
  selectedLeader: string;
  selectedPersonnel: string;
  debouncedSearchTerm: string;
  sortConfig: { key: 'total_revenue'; direction: 'asc' | 'desc' } | null;
}

/**
 * Hook to fetch TikTok shops data with profile information
 * @returns Query result with TikTok shops data
 */
const useTiktokShops = () => {
  return useQuery({
    queryKey: ['tiktok-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_shops')
        .select(`
          *,
          profile:profiles (
            id,
            full_name,
            email,
            manager:profiles!profiles_manager_id_fkey (
              id,
              full_name,
              email
            )
          )
        `);

      if (error) {
        console.error('Error fetching TikTok shops:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to process and filter TikTok comprehensive report data
 * @param props - Filter and sort configuration
 * @returns Processed TikTok report data with statistics
 */
export const useTiktokComprehensiveReportData = ({
  selectedMonth,
  selectedLeader,
  selectedPersonnel,
  debouncedSearchTerm,
  sortConfig,
}: UseTiktokComprehensiveReportDataProps) => {
  const { data: reportsData, isLoading: reportsLoading } = useTiktokComprehensiveReports(0, 10000);
  const reports = reportsData?.data || [];
  const { data: allShops = [], isLoading: shopsLoading } = useTiktokShops();

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  const { data: prevMonthReportsData } = useTiktokComprehensiveReports(0, 10000);
  const prevMonthReports = prevMonthReportsData?.data || [];

  const isLoading = reportsLoading || shopsLoading;

  const leaders = useMemo(() => {
    if (!allShops.length) return [];
    
    const leadersMap = new Map();
    allShops.forEach((shop: any) => {
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
      shopsToConsider = allShops.filter((shop: any) => shop.profile?.manager?.id === selectedLeader);
    }

    shopsToConsider.forEach((shop: any) => {
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

    // Filter shops based on search term and personnel/leader selection
    let filteredShops = allShops;
    
    if (debouncedSearchTerm) {
      filteredShops = filteredShops.filter(shop =>
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    if (selectedPersonnel !== 'all') {
      filteredShops = filteredShops.filter((shop: any) => shop.profile?.id === selectedPersonnel);
    } else if (selectedLeader !== 'all') {
      filteredShops = filteredShops.filter((shop: any) => shop.profile?.manager?.id === selectedLeader);
    }

    // Filter reports by selected month
    const currentMonthReports = reports.filter(report => {
      const reportMonth = format(parseISO(report.report_date), "yyyy-MM");
      return reportMonth === selectedMonth;
    });

    const prevMonthFilteredReports = prevMonthReports.filter(report => {
      const reportMonth = format(parseISO(report.report_date), "yyyy-MM");
      return reportMonth === previousMonth;
    });

    // Create maps for quick lookup
    const reportsMap = new Map<string, TiktokComprehensiveReport[]>();
    currentMonthReports.forEach(report => {
      if (!report.shop_id) return;
      if (!reportsMap.has(report.shop_id)) reportsMap.set(report.shop_id, []);
      reportsMap.get(report.shop_id)!.push(report);
    });

    const prevMonthReportsMap = new Map<string, TiktokComprehensiveReport[]>();
    prevMonthFilteredReports.forEach(report => {
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
      
      // Find goals from any report in the month (prioritize latest with goals)
      const sortedReports = shopReports.sort((a: TiktokComprehensiveReport, b: TiktokComprehensiveReport) => 
        new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
      );
      
      const latestReportWithGoals = sortedReports.find(r => r.feasible_goal != null || r.breakthrough_goal != null);
      const latestReport = sortedReports[0];
      
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

      const personnelName = (shop as any).profile?.full_name || 'Chưa có tên';
      const leaderName = (shop as any).profile?.manager?.full_name || 'Chưa có tên';

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: shop.status,
        personnel_id: (shop as any).profile?.id,
        personnel_name: personnelName,
        personnel_account: (shop as any).profile?.email || 'N/A',
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
  }, [allShops, reports, prevMonthReports, isLoading, selectedLeader, selectedPersonnel, sortConfig, debouncedSearchTerm, selectedMonth, previousMonth]);

  return {
    isLoading,
    monthlyShopTotals,
    leaders,
    personnelOptions,
  };
};