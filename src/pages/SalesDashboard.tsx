import React, { useState, useMemo } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTeams } from "@/hooks/useTeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import RevenueChart from "@/components/RevenueChart";
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

  const { data: dashboardData, isLoading } = useDashboardStats({
    month: selectedMonth,
    teamId: selectedTeam,
  });

  const { data: teamsData } = useTeams();

  const underperformingShops = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.shopPerformance
      .filter(shop => shop.status === 'underperforming')
      .map(shop => ({
        shop_name: shop.shop_name,
        total_revenue: shop.total_revenue,
        feasible_goal: shop.feasible_goal,
        deficit: Math.max(0, shop.feasible_goal - shop.total_revenue),
      }));
  }, [dashboardData]);

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
            <StatCard title="Tổng số Shop" value={dashboardData?.totalShops || 0} icon={Store} />
            <StatCard title="Tổng số Nhân viên" value={dashboardData?.totalEmployees || 0} icon={Users} />
            <StatCard title="Shop đạt mục tiêu khả thi" value={dashboardData?.shopsFeasible || 0} icon={CheckCircle} />
            <StatCard title="Shop đạt mục tiêu đột phá" value={dashboardData?.shopsBreakthrough || 0} icon={Award} />
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop không đạt mục tiêu</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{dashboardData?.shopsUnderperforming || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={dashboardData?.dailyChartData || []} />
            </div>
            <div className="lg:col-span-1">
              <ShopPerformance performanceData={dashboardData?.shopPerformance || []} isLoading={isLoading} />
            </div>
          </div>
        </>
      )}

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={underperformingShops}
      />
    </div>
  );
};

export default SalesDashboard;