import { useMemo } from "react";
import { TiktokComprehensiveReport } from "@/hooks/useTiktokComprehensiveReports";
import { format, subMonths, parseISO, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { TiktokShop } from "@/types/tiktokShop";
import { useUserProfile } from "./useUserProfile"; // Import useUserProfile
import { toast } from "sonner";

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
export const useTiktokShops = () => {
  const { data: userProfile } = useUserProfile(); // Get user profile

  return useQuery({
    queryKey: ['tiktok-shops-for-dashboard', userProfile?.id], // Add userProfile.id to query key
    queryFn: async () => {
      let query = supabase
        .from('tiktok_shops') // Directly query tiktok_shops table
        .select(`
          *,
          profile:profiles!profile_id (
            id,
            full_name,
            email,
            manager_id,
            manager:profiles!manager_id (
              id,
              full_name,
              email
            )
          )
        `);

      // Apply filters based on user role: non-admins only see 'Vận hành' type and 'Đang Vận Hành' status
      if (userProfile?.role !== 'admin') {
        query = query.eq('type', 'Vận hành').eq('status', 'Đang Vận Hành');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching TikTok shops:', error);
        toast.error("Lỗi tải danh sách shop TikTok.", { description: error.message });
        throw error;
      }

      return (data || []) as unknown as TiktokShop[];
    },
    enabled: !!userProfile, // Enable only when userProfile is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for TikTok Goal Setting - simplified data fetching
 * Only fetches necessary data for goal setting interface
 */
export const useTiktokGoalSettingData = (selectedMonth: string) => {
  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();
  
  // Only fetch goals data for the selected month
  const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['tiktok-goals', selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthDate = new Date(Date.UTC(year, month - 1, 1));
      const startDate = format(monthDate, "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .select('shop_id, feasible_goal, breakthrough_goal')
        .gte('report_date', startDate)
        .lte('report_date', endDate);

      if (error) {
        toast.error("Lỗi tải dữ liệu mục tiêu TikTok.", { description: error.message });
        throw error;
      }

      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute for goals data
  });

  const monthlyShopTotals = useMemo(() => {
    if (shopsLoading || goalsLoading) return [];

    // Create a map of shop goals with robust logic
    const goalsMap = new Map<string, { feasible_goal: number | null; breakthrough_goal: number | null }>();
    
    // Group goals by shop_id
    const goalsByShop: Record<string, {feasible_goal: number | null, breakthrough_goal: number | null}[]> = goalsData.reduce((acc, goal) => {
      if (goal.shop_id) {
        if (!acc[goal.shop_id]) {
          acc[goal.shop_id] = [];
        }
        acc[goal.shop_id].push(goal);
      }
      return acc;
    }, {});

    // For each shop, find the first non-null goal
    Object.keys(goalsByShop).forEach(shopId => {
      const shopGoals = goalsByShop[shopId];
      const feasibleGoal = shopGoals.find(g => g.feasible_goal !== null)?.feasible_goal ?? null;
      const breakthroughGoal = shopGoals.find(g => g.breakthrough_goal !== null)?.breakthrough_goal ?? null;
      goalsMap.set(shopId, { feasible_goal: feasibleGoal, breakthrough_goal: breakthroughGoal });
    });

    return shops.map(shop => ({
      shop_id: shop.id,
      shop_name: shop.name,
      personnel_name: shop.profile?.full_name || shop.profile?.email || "Chưa phân công",
      leader_name: shop.profile?.manager?.full_name || shop.profile?.manager?.email || "Chưa có leader",
      feasible_goal: goalsMap.get(shop.id)?.feasible_goal ?? null,
      breakthrough_goal: goalsMap.get(shop.id)?.breakthrough_goal ?? null,
    }));
  }, [shops, goalsData, shopsLoading, goalsLoading]);

  const leaders = useMemo(() => {
    if (shopsLoading) return [];
    
    const leadersMap = new Map();
    shops.forEach((shop: any) => {
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
  }, [shops, shopsLoading]);

  return {
    isLoading: shopsLoading || goalsLoading,
    monthlyShopTotals,
    leaders,
  };
};

/**
 * Hook to process and filter TikTok comprehensive report data
 * @param props - Filter and sort configuration
 * @returns Processed TikTok report data with statistics
 */
// Optimized hook to fetch only necessary data for specific months
const useTiktokReportsForMonth = (month: string) => {
  return useQuery<TiktokComprehensiveReport[]>({
    queryKey: ['tiktok-reports-month', month],
    queryFn: async () => {
      const [year, monthNum] = month.split('-').map(Number);
      const monthDate = new Date(Date.UTC(year, monthNum - 1, 1));
      const startDate = format(monthDate, "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .select(`
          *,
          tiktok_shops (
            *,
            profiles (
              *,
              manager:profiles!manager_id (
                *
              )
            )
          )
        `)
        .gte('report_date', startDate)
        .lte('report_date', endDate);

      if (error) {
        toast.error(`Lỗi tải báo cáo tháng ${month}.`, { description: error.message });
        throw error;
      }

      return (data as unknown as TiktokComprehensiveReport[]) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTiktokComprehensiveReportData = ({
  selectedMonth,
  selectedLeader,
  selectedPersonnel,
  debouncedSearchTerm,
  sortConfig,
}: UseTiktokComprehensiveReportDataProps) => {
  const { data: allShops = [], isLoading: shopsLoading } = useTiktokShops();
  
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);

  // Only fetch reports for selected month and previous month
  const { data: reports = [], isLoading: currentMonthLoading } = useTiktokReportsForMonth(selectedMonth);
  
  const { data: prevMonthReports = [], isLoading: prevMonthLoading } = useTiktokReportsForMonth(previousMonth);

  const isLoading = currentMonthLoading || prevMonthLoading || shopsLoading;

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

  // Fetch goals data separately for the selected month
  const { data: goalsData = [] } = useQuery({
    queryKey: ['tiktok-goals', selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthDate = new Date(Date.UTC(year, month - 1, 1));
      const startDate = format(monthDate, "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('tiktok_comprehensive_reports')
        .select('shop_id, feasible_goal, breakthrough_goal, tiktok_shops(name)')
        .gte('report_date', startDate)
        .lte('report_date', endDate);

      if (error) {
        toast.error("Lỗi tải dữ liệu mục tiêu.", { description: error.message });
        throw error;
      }

      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute for goals data
  });

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

    // Reports are already filtered by month in the query, no need to filter again
    const currentMonthReports = reports;
    const prevMonthFilteredReports = prevMonthReports;

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

    // Create goals map for quick lookup
    const goalsMap = new Map();
    goalsData.forEach(goal => {
      if (!goal.shop_id) return;
      if (!goalsMap.has(goal.shop_id) || 
          goalsMap.get(goal.shop_id).feasible_goal === null ||
          goalsMap.get(goal.shop_id).breakthrough_goal === null) {
        goalsMap.set(goal.shop_id, {
          feasible_goal: goal.feasible_goal,
          breakthrough_goal: goal.breakthrough_goal
        });
      }
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

      
      // Calculate aggregated TikTok-specific metrics
      const platform_subsidized_revenue = shopReports.reduce((sum, r) => sum + (r.platform_subsidized_revenue || 0), 0);
      const items_sold = shopReports.reduce((sum, r) => sum + (r.items_sold || 0), 0);
      const total_buyers = shopReports.reduce((sum, r) => sum + (r.total_buyers || 0), 0);
      const total_visits = shopReports.reduce((sum, r) => sum + (r.total_visits || 0), 0);
      const store_visits = shopReports.reduce((sum, r) => sum + (r.store_visits || 0), 0);
      const sku_orders = shopReports.reduce((sum, r) => sum + (r.sku_orders || 0), 0);
      const total_orders = shopReports.reduce((sum, r) => sum + (r.total_orders || 0), 0);
      
      // Calculate conversion rate (orders / visits)
      const conversion_rate = total_visits > 0 ? (total_orders / total_visits) * 100 : 0;

      // Get goals from goals map first, then fallback to reports  
      const goalsFromMap = goalsMap.get(shop.id);
      let feasible_goal = goalsFromMap?.feasible_goal;
      let breakthrough_goal = goalsFromMap?.breakthrough_goal;
      
      // If no goals found in goals map, try to find from reports
      if (feasible_goal === null && breakthrough_goal === null && shopReports.length > 0) {
        const sortedReports = shopReports.sort((a: TiktokComprehensiveReport, b: TiktokComprehensiveReport) => 
          new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
        );
        
        const latestReportWithGoals = sortedReports.find(r => r.feasible_goal != null || r.breakthrough_goal != null);
        if (latestReportWithGoals) {
          feasible_goal = latestReportWithGoals.feasible_goal;
          breakthrough_goal = latestReportWithGoals.breakthrough_goal;
        }
      }
      
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

      const personnelName = (shop as any).profile?.full_name || (shop as any).profile?.email || 'Chưa phân công';
      const leaderName = (shop as any).profile?.manager?.full_name || (shop as any).profile?.manager?.email || 'Chưa có leader';

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        shop_status: shop.status,
        type: shop.type,
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
        platform_subsidized_revenue,
        items_sold,
        total_buyers,
        total_visits,
        store_visits,
        sku_orders,
        total_orders,
        conversion_rate,
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
  }, [allShops, reports, prevMonthReports, goalsData, isLoading, selectedLeader, selectedPersonnel, sortConfig, debouncedSearchTerm, selectedMonth, previousMonth]);

  return {
    isLoading,
    monthlyShopTotals,
    leaders,
    personnelOptions,
  };
};