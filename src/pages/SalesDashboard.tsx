import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Calendar, Store, Users, Target, AlertTriangle, Award, CheckCircle, TrendingUp } from "lucide-react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
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
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 10000 });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const isLoading = reportsLoading || shopsLoading || employeesLoading || teamsLoading;

  const leaders = useMemo(() => employeesData?.employees.filter(e => e.role === 'leader') || [], [employeesData]);
  const teams = useMemo(() => teamsData || [], [teamsData]);

  const filteredShops = useMemo(() => {
    if (!shopsData) return [];
    return shopsData.shops;
  }, [shopsData]);

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
        leader_id: shop.leader_id,
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
      totalEmployees: employeesData?.totalCount || 0,
      feasibleMet,
      breakthroughMet,
      almostMet,
      notMet,
      underperformingShops,
      pieData,
      shopPerformance,
    };
  }, [reports, prevMonthReports, filteredShops, employeesData]);

  const leaderPerformanceData = useMemo(() => {
    if (!performanceData || !leaders || !employeesData?.employees || !teams) return [];
    
    const excludedTeams = ["Team Công Nghệ", "Team Marketing", "Team Sale Hoàng"];
    const excludedTeamIds = teams.filter(t => excludedTeams.includes(t.name)).map(t => t.id);
    
    const filteredLeaders = leaders.filter(leader => 
        !excludedTeamIds.includes(leader.team_id || '') &&
        leader.name !== 'Đỗ Trung Kiên'
    );

    const leaderStats = new Map<string, {
        leader_name: string;
        shop_count: number;
        personnel_count: number;
        breakthroughMet: number;
        feasibleMet: number;
        almostMet: number;
        notMet: number;
    }>();

    // Initialize stats for each filtered leader
    filteredLeaders.forEach(leader => {
        leaderStats.set(leader.id, {
            leader_name: leader.name,
            shop_count: 0,
            personnel_count: employeesData.employees.filter(e => e.leader_id === leader.id && e.role === 'personnel').length,
            breakthroughMet: 0,
            feasibleMet: 0,
            almostMet: 0,
            notMet: 0,
        });
    });

    // Aggregate shop performance for each leader
    performanceData.shopPerformance.forEach(shop => {
        if (shop.leader_id && leaderStats.has(shop.leader_id)) {
            const stats = leaderStats.get(shop.leader_id)!;
            stats.shop_count++;

            const projectedRevenue = shop.projected_revenue;
            const feasibleGoal = shop.feasible_goal;
            const breakthroughGoal = shop.breakthrough_goal;

            if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
                stats.breakthroughMet++;
            } else if (feasibleGoal && projectedRevenue >= feasibleGoal) {
                stats.feasibleMet++;
            } else if (feasibleGoal && projectedRevenue >= feasibleGoal * 0.8) {
                stats.almostMet++;
            } else {
                stats.notMet++;
            }
        }
    });

    return Array.from(leaderStats.values());
  }, [performanceData, leaders, employeesData, teams]);

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