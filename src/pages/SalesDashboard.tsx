import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Calendar, Store, Users, Target, AlertTriangle, Award, CheckCircle } from "lucide-react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import PerformancePieChart from "@/components/dashboard/PerformancePieChart";
import PerformanceTrendChart, { TrendData } from "@/components/dashboard/PerformanceTrendChart";
import { useMonthlyPerformance } from "@/hooks/useMonthlyPerformance";

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
  const [selectedTeam, setSelectedTeam] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "" });
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 10000 });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: monthlyReports, isLoading: monthlyLoading } = useMonthlyPerformance(6);

  const isLoading = reportsLoading || shopsLoading || employeesLoading || teamsLoading || monthlyLoading;

  const filteredShops = useMemo(() => {
    if (!shopsData) return [];
    if (selectedTeam === "all") return shopsData.shops;
    return shopsData.shops.filter(shop => shop.team_id === selectedTeam);
  }, [shopsData, selectedTeam]);

  const performanceData = useMemo(() => {
    const filteredShopIds = new Set(filteredShops.map(s => s.id));
    const relevantReports = reports.filter(r => r.shop_id && filteredShopIds.has(r.shop_id));

    const shopPerformance = new Map<string, { total_revenue: number; feasible_goal: number | null; breakthrough_goal: number | null }>();

    relevantReports.forEach(report => {
      if (!report.shop_id) return;
      const current = shopPerformance.get(report.shop_id) || { total_revenue: 0, feasible_goal: null, breakthrough_goal: null };
      current.total_revenue += report.total_revenue || 0;
      if (report.feasible_goal) current.feasible_goal = report.feasible_goal;
      if (report.breakthrough_goal) current.breakthrough_goal = report.breakthrough_goal;
      shopPerformance.set(report.shop_id, current);
    });

    let feasibleMet = 0;
    let breakthroughMet = 0;
    const underperformingShops: any[] = [];

    shopPerformance.forEach((data, shopId) => {
      const shop = filteredShops.find(s => s.id === shopId);
      if (data.breakthrough_goal && data.total_revenue >= data.breakthrough_goal) {
        breakthroughMet++;
      } else if (data.feasible_goal && data.total_revenue >= data.feasible_goal) {
        feasibleMet++;
      } else {
        underperformingShops.push({
          shop_name: shop?.name || 'N/A',
          total_revenue: data.total_revenue,
          feasible_goal: data.feasible_goal,
          deficit: Math.max(0, (data.feasible_goal || 0) - data.total_revenue),
        });
      }
    });

    const pieData = [
      { name: 'Đột phá', value: breakthroughMet },
      { name: 'Khả thi', value: feasibleMet },
      { name: 'Chưa đạt', value: underperformingShops.length },
    ];

    return {
      totalShops: filteredShops.length,
      totalEmployees: employeesData?.totalCount || 0,
      feasibleMet,
      breakthroughMet,
      didNotMeet: underperformingShops.length,
      underperformingShops,
      pieData,
    };
  }, [reports, filteredShops, employeesData]);

  const trendData = useMemo(() => {
    if (!monthlyReports) return [];

    const monthlyPerformance: Record<string, TrendData> = {};

    monthlyReports.forEach(report => {
      const month = format(new Date(report.report_date), "yyyy-MM");
      if (!monthlyPerformance[month]) {
        monthlyPerformance[month] = { month, 'Đột phá': 0, 'Khả thi': 0, 'Chưa đạt': 0 };
      }

      const shopPerformance = {
        total_revenue: report.total_revenue || 0,
        feasible_goal: report.feasible_goal,
        breakthrough_goal: report.breakthrough_goal,
      };

      if (shopPerformance.breakthrough_goal && shopPerformance.total_revenue >= shopPerformance.breakthrough_goal) {
        monthlyPerformance[month]['Đột phá']++;
      } else if (shopPerformance.feasible_goal && shopPerformance.total_revenue >= shopPerformance.feasible_goal) {
        monthlyPerformance[month]['Khả thi']++;
      } else {
        monthlyPerformance[month]['Chưa đạt']++;
      }
    });

    return Object.values(monthlyPerformance).sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyReports]);

  const teamPieCharts = useMemo(() => {
    if (!teamsData || !reports) return [];

    return teamsData.map(team => {
      const teamShops = shopsData?.shops.filter(s => s.team_id === team.id) || [];
      const teamShopIds = new Set(teamShops.map(s => s.id));
      const teamReports = reports.filter(r => r.shop_id && teamShopIds.has(r.shop_id));

      const shopPerformance = new Map<string, { total_revenue: number; feasible_goal: number | null; breakthrough_goal: number | null }>();
      teamReports.forEach(report => {
        if (!report.shop_id) return;
        const current = shopPerformance.get(report.shop_id) || { total_revenue: 0, feasible_goal: null, breakthrough_goal: null };
        current.total_revenue += report.total_revenue || 0;
        if (report.feasible_goal) current.feasible_goal = report.feasible_goal;
        if (report.breakthrough_goal) current.breakthrough_goal = report.breakthrough_goal;
        shopPerformance.set(report.shop_id, current);
      });

      let feasibleMet = 0;
      let breakthroughMet = 0;
      let didNotMeet = 0;

      shopPerformance.forEach(data => {
        if (data.breakthrough_goal && data.total_revenue >= data.breakthrough_goal) {
          breakthroughMet++;
        } else if (data.feasible_goal && data.total_revenue >= data.feasible_goal) {
          feasibleMet++;
        } else {
          didNotMeet++;
        }
      });

      return {
        teamName: team.name,
        pieData: [
          { name: 'Đột phá', value: breakthroughMet },
          { name: 'Khả thi', value: feasibleMet },
          { name: 'Chưa đạt', value: didNotMeet },
        ]
      };
    });
  }, [teamsData, reports, shopsData]);

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
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Team</SelectItem>
              {teamsData?.map(team => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PerformancePieChart data={performanceData.pieData} title="Phân bố hiệu suất toàn công ty" />
            {teamPieCharts.map(chart => (
              <PerformancePieChart key={chart.teamName} data={chart.pieData} title={`Hiệu suất Team ${chart.teamName}`} />
            ))}
          </div>

          <PerformanceTrendChart data={trendData} title="Xu hướng hiệu suất 6 tháng gần nhất" />
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