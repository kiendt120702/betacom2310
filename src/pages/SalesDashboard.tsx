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
import PerformanceDetailsDialog from "@/components/dashboard/PerformanceDetailsDialog";

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
  const [selectedPerformanceCategory, setSelectedPerformanceCategory] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
    const operationalShops = filteredShops.filter(shop => shop.status === 'Đang Vận Hành');
    const personnelIds = new Set(operationalShops.map(shop => shop.profile?.id).filter(Boolean));
    const totalEmployees = personnelIds.size;

    const shopPerformance = new Map<string, {
      shop_name: string;
      personnel_name: string;
      leader_name: string;
      total_revenue: number;
      feasible_goal: number | null;
      breakthrough_goal: number | null;
      projected_revenue: number;
      team_id: string | null;
      leader_id: string | null;
    }>();

    operationalShops.forEach(shop => {
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
          projected_revenue = (total_revenue / lastDay) * new Date(new Date(last_report_date).getFullYear(), new Date(last_report_date).getMonth() + 1, 0).getDate();
        } else {
          projected_revenue = total_revenue;
        }
      } else {
        projected_revenue = total_revenue;
      }

      shopPerformance.set(shop.id, {
        shop_name: shop.name,
        personnel_name: shop.profile?.full_name || 'N/A',
        leader_name: shop.profile?.manager?.full_name || 'N/A',
        total_revenue,
        feasible_goal: shopReports[0]?.feasible_goal ?? null,
        breakthrough_goal: shopReports[0]?.breakthrough_goal ?? null,
        projected_revenue,
        team_id: shop.team_id,
        leader_id: shop.profile?.manager?.id || null,
      });
    });

    let breakthroughMet = 0;
    let feasibleMet = 0;
    let notMet80Percent = 0;
    const underperformingShops: any[] = [];
    let shopsWithGoals = 0;
    let shopsWithoutGoals = 0;

    shopPerformance.forEach((data) => {
      const projectedRevenue = data.projected_revenue;
      const feasibleGoal = data.feasible_goal;
      const breakthroughGoal = data.breakthrough_goal;

      if (feasibleGoal && feasibleGoal > 0) {
        shopsWithGoals++;
        if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
          breakthroughMet++;
        }
        if (projectedRevenue >= feasibleGoal) {
          feasibleMet++;
        }
        if (projectedRevenue < feasibleGoal * 0.8) {
          notMet80Percent++;
          underperformingShops.push({
            shop_name: data.shop_name,
            total_revenue: data.total_revenue,
            projected_revenue: data.projected_revenue,
            feasible_goal: data.feasible_goal,
            breakthrough_goal: data.breakthrough_goal,
            deficit: Math.max(0, (data.feasible_goal || 0) - data.total_revenue),
          });
        }
      } else {
        shopsWithoutGoals++;
      }
    });

    const almostMet = shopsWithGoals - feasibleMet - notMet80Percent;

    const pieData = [
      { name: 'Đột phá', value: breakthroughMet },
      { name: 'Khả thi', value: feasibleMet - breakthroughMet },
      { name: 'Gần đạt', value: almostMet },
      { name: 'Chưa đạt', value: notMet80Percent },
      { name: 'Chưa có mục tiêu', value: shopsWithoutGoals },
    ];

    return {
      totalShops: operationalShops.length,
      totalEmployees,
      feasibleMet,
      breakthroughMet,
      almostMet,
      notMet80Percent,
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
      let feasibleOnlyMet = 0;
      let almostMet = 0;
      let notMet = 0;

      shopIdsForLeader.forEach(shopId => {
        const data = performanceData.shopPerformance.get(shopId);
        if (data) {
          const projectedRevenue = data.projected_revenue;
          const feasibleGoal = data.feasible_goal;
          const breakthroughGoal = data.breakthrough_goal;

          if (feasibleGoal && feasibleGoal > 0) {
            if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
              breakthroughMet++;
            } else if (projectedRevenue >= feasibleGoal) {
              feasibleOnlyMet++;
            } else if (projectedRevenue >= feasibleGoal * 0.8) {
              almostMet++;
            } else {
              notMet++;
            }
          }
        }
      });

      const personnelCount = personnelMap.size;

      return {
        leader_name: leader.name,
        shop_count: leaderShops.length,
        personnel_count: personnelCount,
        breakthroughMet,
        feasibleMet: feasibleOnlyMet,
        almostMet,
        notMet,
      };
    });
  }, [performanceData.shopPerformance, leaders, filteredShops]);

  const shopsByCategory = useMemo(() => {
    const categories: Record<string, any[]> = {
      'Đột phá': [],
      'Khả thi': [],
      'Gần đạt': [],
      'Chưa đạt': [],
      'Chưa có mục tiêu': [],
    };
    performanceData.shopPerformance.forEach((data) => {
      const projectedRevenue = data.projected_revenue;
      const feasibleGoal = data.feasible_goal;
      const breakthroughGoal = data.breakthrough_goal;

      if (feasibleGoal && feasibleGoal > 0) {
        if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
          categories['Đột phá'].push(data);
        } else if (projectedRevenue >= feasibleGoal) {
          categories['Khả thi'].push(data);
        } else if (projectedRevenue >= feasibleGoal * 0.8) {
          categories['Gần đạt'].push(data);
        } else {
          categories['Chưa đạt'].push(data);
        }
      } else {
        categories['Chưa có mục tiêu'].push(data);
      }
    });
    return categories;
  }, [performanceData.shopPerformance]);

  const handleCategoryClick = (category: string) => {
    setSelectedPerformanceCategory(category);
    setIsDetailsDialogOpen(true);
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Tổng số Shop (Vận hành)" value={performanceData.totalShops} icon={Store} />
            <StatCard title="Tổng số Nhân viên (Vận hành)" value={performanceData.totalEmployees} icon={Users} />
            <StatCard title="Đạt mục tiêu đột phá" value={performanceData.breakthroughMet} icon={Award} onClick={() => handleCategoryClick('Đột phá')} />
            <StatCard title="Đạt mục tiêu khả thi" value={performanceData.feasibleMet - performanceData.breakthroughMet} icon={CheckCircle} onClick={() => handleCategoryClick('Khả thi')} />
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleCategoryClick('Chưa đạt')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chưa đạt 80% mục tiêu</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{performanceData.notMet80Percent}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PerformancePieChart data={performanceData.pieData} title="Phân bố hiệu suất" onCategoryClick={handleCategoryClick} />
            <LeaderPerformanceDashboard data={leaderPerformanceData} />
          </div>
        </>
      )}

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />
      <PerformanceDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        categoryName={selectedPerformanceCategory}
        shops={selectedPerformanceCategory ? shopsByCategory[selectedPerformanceCategory] : []}
      />
    </div>
  );
};

export default SalesDashboard;