import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ShopPerformance from "@/components/dashboard/ShopPerformance";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Calendar, Store, Users, Target, AlertTriangle, Award, CheckCircle } from "lucide-react";

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

  const isLoading = reportsLoading || shopsLoading || employeesLoading || teamsLoading;

  const filteredShops = useMemo(() => {
    if (!shopsData) return [];
    if (selectedTeam === "all") return shopsData.shops;
    return shopsData.shops.filter(shop => shop.team_id === selectedTeam);
  }, [shopsData, selectedTeam]);

  const filteredReports = useMemo(() => {
    const filteredShopIds = new Set(filteredShops.map(s => s.id));
    return reports.filter(r => r.shop_id && filteredShopIds.has(r.shop_id));
  }, [reports, filteredShops]);

  const kpiData = useMemo(() => {
    const shopPerformance = new Map<string, { total_revenue: number; feasible_goal: number | null; breakthrough_goal: number | null }>();

    filteredReports.forEach(report => {
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

    return {
      totalShops: filteredShops.length,
      totalEmployees: employeesData?.totalCount || 0,
      feasibleMet,
      breakthroughMet,
      didNotMeet: underperformingShops.length,
      underperformingShops,
    };
  }, [filteredReports, filteredShops, employeesData]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; revenue: number }> = {};
    filteredReports.forEach(report => {
      const date = report.report_date.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0 };
      }
      dailyData[date].revenue += report.total_revenue || 0;
    });
    return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredReports]);

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
            <StatCard title="Tổng số Shop" value={kpiData.totalShops} icon={Store} />
            <StatCard title="Tổng số Nhân viên" value={kpiData.totalEmployees} icon={Users} />
            <StatCard title="Shop đạt mục tiêu khả thi" value={kpiData.feasibleMet} icon={CheckCircle} />
            <StatCard title="Shop đạt mục tiêu đột phá" value={kpiData.breakthroughMet} icon={Award} />
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop không đạt mục tiêu</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{kpiData.didNotMeet}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={chartData} />
            </div>
            <div className="lg:col-span-1">
              <ShopPerformance reports={filteredReports} isLoading={isLoading} />
            </div>
          </div>
        </>
      )}

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={kpiData.underperformingShops}
      />
    </div>
  );
};

export default SalesDashboard;