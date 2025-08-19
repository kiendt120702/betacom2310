import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Calendar, Store, Users, Target, AlertTriangle, Award, CheckCircle } from "lucide-react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import PerformancePieChart from "@/components/dashboard/PerformancePieChart";
import PerformanceTrendChart, { TrendData } from "@/components/dashboard/PerformanceTrendChart";
import { useMonthlyPerformance } from "@/hooks/useMonthlyPerformance";
import DailyRevenueReport from "@/components/admin/DailyRevenueReport";

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
  const [selectedLeader, setSelectedLeader] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "" });
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 10000 });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: monthlyReports, isLoading: monthlyLoading } = useMonthlyPerformance(6);

  const isLoading = reportsLoading || shopsLoading || employeesLoading || teamsLoading || monthlyLoading;

  const leaders = useMemo(() => employeesData?.employees.filter(e => e.role === 'leader') || [], [employeesData]);

  const filteredShops = useMemo(() => {
    if (!shopsData) return [];
    let shops = shopsData.shops;
    if (selectedLeader !== "all") {
      shops = shops.filter(shop => shop.leader_id === selectedLeader);
    }
    return shops;
  }, [shopsData, selectedLeader]);

  const performanceData = useMemo(() => {
    const filteredShopIds = new Set(filteredShops.map(s => s.id));
    const relevantReports = reports.filter(r => r.shop_id && filteredShopIds.has(r.shop_id));

    const prevMonthReportsMap = new Map<string, any[]>();
    prevMonthReports.forEach(report => {
      if (!report.shop_id) return;
      if (!prevMonthReportsMap.has(report.shop_id)) {
        prevMonthReportsMap.set(report.shop_id, []);
      }
      prevMonthReportsMap.get(report.shop_id)!.push(report);
    });

    const shopPerformance = new Map<string, { 
        total_revenue: number; 
        feasible_goal: number | null; 
        breakthrough_goal: number | null;
        projected_revenue: number;
    }>();

    filteredShops.forEach(shop => {
        shopPerformance.set(shop.id, {
            total_revenue: 0,
            feasible_goal: null,
            breakthrough_goal: null,
            projected_revenue: 0,
        });
    });

    relevantReports.forEach(report => {
      if (!report.shop_id) return;
      const current = shopPerformance.get(report.shop_id)!;
      current.total_revenue += report.total_revenue || 0;
      if (report.feasible_goal != null) current.feasible_goal = report.feasible_goal;
      if (report.breakthrough_goal != null) current.breakthrough_goal = report.breakthrough_goal;
    });

    shopPerformance.forEach((data, shopId) => {
        const shopReports = relevantReports.filter(r => r.shop_id === shopId);
        const prevMonthShopReports = prevMonthReportsMap.get(shopId) || [];

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
            ? (data.total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue
            : data.total_revenue > 0 ? Infinity : 0;

        let projected_revenue = 0;
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        if (total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
            projected_revenue = total_previous_month_revenue * (1 + growth);
        } else if (last_report_date) {
            const lastDay = parseISO(last_report_date).getDate();
            if (lastDay > 0) {
                const dailyAverage = data.total_revenue / lastDay;
                projected_revenue = dailyAverage * daysInMonth;
            } else {
                projected_revenue = data.total_revenue;
            }
        } else {
            projected_revenue = data.total_revenue;
        }
        data.projected_revenue = projected_revenue;
    });

    let breakthroughMet = 0;
    let feasibleMet = 0;
    let almostMet = 0;
    let notMet = 0;
    const underperformingShops: any[] = [];

    shopPerformance.forEach((data, shopId) => {
      const shop = filteredShops.find(s => s.id === shopId);
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
          shop_name: shop?.name || 'N/A',
          total_revenue: data.total_revenue,
          feasible_goal: data.feasible_goal,
          deficit: Math.max(0, (data.feasible_goal || 0) - projectedRevenue),
        });
      } else {
        notMet++;
        if (feasibleGoal) {
          underperformingShops.push({
            shop_name: shop?.name || 'N/A',
            total_revenue: data.total_revenue,
            feasible_goal: data.feasible_goal,
            deficit: Math.max(0, (data.feasible_goal || 0) - projectedRevenue),
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
      didNotMeet: almostMet + notMet,
      underperformingShops,
      pieData,
    };
  }, [reports, prevMonthReports, filteredShops, employeesData, selectedMonth]);

  const trendData = useMemo(() => {
    if (!monthlyReports) return [];

    let filteredReports = monthlyReports;
    if (selectedLeader !== 'all') {
      filteredReports = filteredReports.filter(r => r.shops?.leader_id === selectedLeader);
    }

    const monthlyPerformance: Record<string, TrendData> = {};

    const reportsByMonth = filteredReports.reduce((acc, report) => {
      const month = format(new Date(report.report_date), "yyyy-MM");
      if (!acc[month]) acc[month] = [];
      acc[month].push(report);
      return acc;
    }, {} as Record<string, typeof filteredReports>);

    for (const month in reportsByMonth) {
      const monthReports = reportsByMonth[month];
      const shopPerformance = new Map<string, { total_revenue: number; feasible_goal: number | null; breakthrough_goal: number | null }>();

      monthReports.forEach(report => {
        if (!report.shop_id) return;
        const current = shopPerformance.get(report.shop_id) || { total_revenue: 0, feasible_goal: null, breakthrough_goal: null };
        current.total_revenue += report.total_revenue || 0;
        if (report.feasible_goal) current.feasible_goal = report.feasible_goal;
        if (report.breakthrough_goal) current.breakthrough_goal = report.breakthrough_goal;
        shopPerformance.set(report.shop_id, current);
      });

      let feasibleMet = 0;
      let breakthroughMet = 0;
      let almostMet = 0;
      let notMet = 0;

      shopPerformance.forEach(data => {
        const totalRevenue = data.total_revenue;
        const feasibleGoal = data.feasible_goal;
        const breakthroughGoal = data.breakthrough_goal;

        if (breakthroughGoal && totalRevenue > breakthroughGoal) {
          breakthroughMet++;
        } else if (feasibleGoal && totalRevenue >= feasibleGoal) {
          feasibleMet++;
        } else if (feasibleGoal && totalRevenue >= feasibleGoal * 0.8) {
          almostMet++;
        } else {
          notMet++;
        }
      });

      monthlyPerformance[month] = {
        month,
        'Đột phá': breakthroughMet,
        'Khả thi': feasibleMet,
        'Gần đạt': almostMet,
        'Chưa đạt': notMet,
      };
    }

    return Object.values(monthlyPerformance).sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyReports, selectedLeader]);

  const getTrendChartTitle = () => {
    let title = "Xu hướng hiệu suất 6 tháng gần nhất";
    if (selectedLeader !== 'all') {
      const leaderName = leaders.find(l => l.id === selectedLeader)?.name;
      title += ` - ${leaderName}`;
    }
    return title;
  };

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
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLeader} onValueChange={setSelectedLeader}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Leader</SelectItem>
              {leaders.map(leader => (
                <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Tổng số Shop" value={performanceData.totalShops} icon={Store} />
            <StatCard title="Tổng số Nhân viên" value={performanceData.totalEmployees} icon={Users} />
            <StatCard title="Shop đạt mục tiêu khả thi" value={performanceData.feasibleMet} icon={CheckCircle} />
            <StatCard title="Shop đạt mục tiêu đột phá" value={performanceData.breakthroughMet} icon={Award} />
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop không đạt mục tiêu</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{performanceData.didNotMeet}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Chú thích màu sắc</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-200 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-green-800 dark:text-green-200">Xanh lá (Đột phá):</span>
                  <span className="text-muted-foreground ml-1">Doanh số tháng &gt; Mục tiêu đột phá</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-yellow-100 border-2 border-yellow-200 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">Vàng (Khả thi):</span>
                  <span className="text-muted-foreground ml-1">Doanh số tháng &ge; Mục tiêu khả thi</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-200 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-red-800 dark:text-red-200">Đỏ (Gần đạt):</span>
                  <span className="text-muted-foreground ml-1">80% &le; Doanh số tháng &lt; Mục tiêu khả thi</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-purple-200 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">Tím (Chưa đạt):</span>
                  <span className="text-muted-foreground ml-1">Doanh số tháng &lt; 80% Mục tiêu khả thi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <PerformancePieChart data={performanceData.pieData} title="Phân bố hiệu suất" />
          </div>
          
          <PerformanceTrendChart data={trendData} title={getTrendChartTitle()} />
          
          <DailyRevenueReport />
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