import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Calendar, Store, Users, Target, AlertTriangle, Award, CheckCircle, TrendingUp } from "lucide-react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useTeams } from "@/hooks/useTeams";
import PerformancePieChart from "@/components/dashboard/PerformancePieChart";
import LeaderPerformanceDashboard from "@/components/dashboard/LeaderPerformanceDashboard";

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: vi }),
    });
  }
  return options;
};

const SalesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "" });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const isLoading = reportsLoading || shopsLoading || teamsLoading;

  const teams = useMemo(() => teamsData || [], [teamsData]);

  const filteredShops = useMemo(() => {
    if (!shopsData) return [];
    return shopsData.shops;
  }, [shopsData]);

  // Generate leaders list from shops data
  const leaders = useMemo(() => {
    if (!filteredShops.length) return [];
    
    const leadersMap = new Map();
    filteredShops.forEach(shop => {
      if (shop.profile?.manager) {
        const manager = shop.profile.manager;
        if (!leadersMap.has(manager.id)) {
          leadersMap.set(manager.id, {
            id: manager.id,
            name: manager.full_name,
          });
        }
      }
    });
    
    return Array.from(leadersMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    );
  }, [filteredShops]);

  const performanceData = useMemo(() => {
    const shopPerformance = new Map<string, {
      shop_name: string;
      total_revenue: number;
      feasible_goal: number | null;
      breakthrough_goal: number | null;
      projected_revenue: number;
      team_id: string | null;
      leader_id: string | null;
    }>();

    filteredShops.forEach(shop => {
      const shopReports = reports.filter(r => r.shop_id === shop.id);
      const prevMonthShopReports = prevMonthReports.filter(r => r.shop_id === shop.id);

      const total_revenue = shopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      const last_report_date = lastReport?.report_date;
      const total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

      let like_for_like_previous_month_revenue = 0;
      if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports
          .filter(r => parseISO(r.report_date).getDate() <= lastDay)
          .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }
      
      const growth = like_for_like_previous_month_revenue > 0
        ? (total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue
        : total_revenue > 0 ? Infinity : 0;

      let projected_revenue = 0;
      if (total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
        projected_revenue = total_previous_month_revenue * (1 + growth);
      } else if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        if (lastDay > 0) {
          const dailyAverage = total_revenue / lastDay;
          projected_revenue = dailyAverage * new Date(new Date(last_report_date).getFullYear(), new Date(last_report_date).getMonth() + 1, 0).getDate();
        } else {
          projected_revenue = total_revenue;
        }
      } else {
        projected_revenue = total_revenue;
      }

      shopPerformance.set(shop.id, {
        shop_name: shop.name,
        total_revenue,
        feasible_goal: shopReports[0]?.feasible_goal ?? null,
        breakthrough_goal: shopReports[0]?.breakthrough_goal ?? null,
        projected_revenue,
        team_id: shop.team_id,
        leader_id: shop.profile?.manager?.id || null,
      });
    });

    let breakthroughMet = 0, feasibleMet = 0, almostMet = 0, notMet = 0;
    const underperformingShops: any[] = [];

    shopPerformance.forEach((data) => {
      const projectedRevenue = data.projected_revenue;
      const feasibleGoal = data.feasible_goal;
      const breakthroughGoal = data.breakthrough_goal;

      if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
        breakthroughMet++;
      } else if (feasibleGoal && projectedRevenue >= feasibleGoal) {
        feasibleMet++;
      } else if (feasibleGoal && projectedRevenue >= feasibleGoal * 0.8) {
        almostMet++;
        underperformingShops.push({
          shop_name: data.shop_name,
          total_revenue: data.total_revenue,
          projected_revenue: data.projected_revenue,
          feasible_goal: data.feasible_goal,
          breakthrough_goal: data.breakthrough_goal,
          deficit: Math.max(0, (data.feasible_goal || 0) - data.total_revenue),
        });
      } else {
        notMet++;
        if (feasibleGoal) {
          underperformingShops.push({
            shop_name: data.shop_name,
            total_revenue: data.total_revenue,
            projected_revenue: data.projected_revenue,
            feasible_goal: data.feasible_goal,
            breakthrough_goal: data.breakthrough_goal,
            deficit: Math.max(0, (data.feasible_goal || 0) - data.total_revenue),
          });
        }
      }
    });

    const pieData = [
      { name: 'Đột phá', value: breakthroughMet },
      { name: 'Khả thi', value: feasibleMet },
      { name: 'Gần đạt', value: almostMet },
      { name: 'Chưa đạt', value: notMet },
    ];

    return {
      totalShops: filteredShops.length,
      totalEmployees: 0,
      feasibleMet,
      breakthroughMet,
      almostMet,
      notMet,
      underperformingShops,
      pieData,
      shopPerformance,
    };
  }, [reports, prevMonthReports, filteredShops]);

  const leaderPerformanceData = useMemo(() => {
    if (!performanceData.shopPerformance.size || leaders.length === 0) return [];

    return leaders.map(leader => {
      const leaderShops = filteredShops.filter(shop => shop.profile?.manager?.id === leader.id);
      const shopIdsForLeader = new Set(leaderShops.map(s => s.id));
      
      const personnelMap = new Map<string, { name: string, shops: any[] }>();
      leaderShops.forEach(shop => {
        if (shop.profile) {
          if (!personnelMap.has(shop.profile.id)) {
            personnelMap.set(shop.profile.id, { name: shop.profile.full_name || shop.profile.email, shops: [] });
          }
          personnelMap.get(shop.profile.id)!.shops.push(shop);
        }
      });

      let breakthroughMet = 0;
      let feasibleMet = 0;
      let almostMet = 0;
      let notMet = 0;

      shopIdsForLeader.forEach(shopId => {
        const data = performanceData.shopPerformance.get(shopId);
        if (data) {
          const projectedRevenue = data.projected_revenue;
          const feasibleGoal = data.feasible_goal;
          const breakthroughGoal = data.breakthrough_goal;

          if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
            breakthroughMet++;
          } else if (feasibleGoal && projectedRevenue >= feasibleGoal) {
            feasibleMet++;
          } else if (feasibleGoal && projectedRevenue >= feasibleGoal * 0.8) {
            almostMet++;
          } else {
            notMet++;
          }
        }
      });

      let personnelMetGoal = 0;
      personnelMap.forEach(personnel => {
        const allShopsMetGoal = personnel.shops.every(shop => {
          const data = performanceData.shopPerformance.get(shop.id);
          return data && data.feasible_goal && data.projected_revenue >= data.feasible_goal;
        });
        if (allShopsMetGoal && personnel.shops.length > 0) {
          personnelMetGoal++;
        }
      });

      const personnelCount = personnelMap.size;
      const personnelCompletionRate = personnelCount > 0 ? (personnelMetGoal / personnelCount) * 100 : 0;

      return {
        leader_name: leader.name,
        shop_count: leaderShops.length,
        personnel_count: personnelCount,
        breakthroughMet,
        feasibleMet,
        almostMet,
        notMet,
        personnelMetGoal,
        personnelCompletionRate,
      };
    });
  }, [performanceData.shopPerformance, leaders, filteredShops]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Dashboard
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <StatCard title="Tổng số Shop" value={performanceData.totalShops} icon={Store} />
            <StatCard title="Tổng số Nhân viên" value={performanceData.totalEmployees} icon={Users} />
            <StatCard title="Đạt mục tiêu đột phá" value={performanceData.breakthroughMet} icon={Award} />
            <StatCard title="Đạt mục tiêu khả thi" value={performanceData.feasibleMet} icon={CheckCircle} />
            <StatCard title="Gần đạt mục tiêu" value={performanceData.almostMet} icon={TrendingUp} />
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chưa đạt mục tiêu</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{performanceData.notMet}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PerformancePieChart data={performanceData.pieData} title="Phân bố hiệu suất" />
            <LeaderPerformanceDashboard data={leaderPerformanceData} />
          </div>
        </>
      )}

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />
    </div>
  );
};

export default SalesDashboard;