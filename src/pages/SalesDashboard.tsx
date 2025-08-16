import React, { useState, useMemo } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTeams } from "@/hooks/useTeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Store, Users, Target, AlertTriangle, Award, CheckCircle, Building2, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

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

  const pieChartData = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: 'Đạt đột phá', value: dashboardData.shopsBreakthrough, color: '#00C49F' },
      { name: 'Đạt khả thi', value: dashboardData.shopsFeasible, color: '#0088FE' },
      { name: 'Chưa đạt', value: dashboardData.shopsUnderperforming, color: '#FF8042' },
    ];
  }, [dashboardData]);

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
            Sales Dashboard
          </h1>
          <p className="text-muted-foreground">Tổng quan hiệu suất bán hàng theo shop</p>
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Tổng số Shop" value={dashboardData?.totalShops || 0} icon={Store} />
            <StatCard title="Tổng số Nhân viên" value={dashboardData?.totalEmployees || 0} icon={Users} />
            <StatCard title="Shop đạt khả thi" value={dashboardData?.shopsFeasible || 0} icon={CheckCircle} className="text-blue-600" />
            <StatCard title="Shop đạt đột phá" value={dashboardData?.shopsBreakthrough || 0} icon={Zap} className="text-green-600" />
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop chưa đạt</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{dashboardData?.shopsUnderperforming || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Nhấn để xem chi tiết</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Distribution Pie Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Phân bố hiệu suất Shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Team Bar Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Doanh thu theo Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.revenueByTeam || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team_name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [new Intl.NumberFormat('vi-VN').format(Number(value)), 'Doanh thu']} />
                    <Bar dataKey="total_revenue" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Xu hướng 6 tháng gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dashboardData?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'total_revenue') {
                        return [new Intl.NumberFormat('vi-VN').format(Number(value)), 'Tổng doanh thu'];
                      }
                      return [value, name === 'breakthrough_count' ? 'Shop đạt đột phá' : 'Shop đạt khả thi'];
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="total_revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="breakthrough_count" stroke="#00C49F" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="feasible_count" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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