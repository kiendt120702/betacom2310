import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Store, Users, Target, AlertTriangle, Award, CheckCircle } from "lucide-react";
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import PerformancePieChart from "@/components/dashboard/PerformancePieChart";
import LeaderPerformanceDashboard from "@/components/dashboard/LeaderPerformanceDashboard";
import LeaderPerformanceChart from "@/components/dashboard/LeaderPerformanceChart";
import { generateMonthOptions } from "@/utils/revenueUtils";

const SalesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);

  const { isLoading, monthlyShopTotals, leaders } = useComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel: "all",
    debouncedSearchTerm: "",
    sortConfig: null,
  });
  
  // Function to determine color category of a shop (matching comprehensive reports)
  const getShopColorCategory = (shopData: any) => {
    const projectedRevenue = shopData.projected_revenue || 0;
    const feasibleGoal = shopData.feasible_goal;
    const breakthroughGoal = shopData.breakthrough_goal;

    if (projectedRevenue <= 0) {
      return "no-color";
    }
    
    if (feasibleGoal == null && breakthroughGoal == null) {
      return "no-color";
    }

    if (feasibleGoal === 0) {
      return "no-color";
    }

    if (breakthroughGoal != null && projectedRevenue > breakthroughGoal) {
      return "green";
    } else if (feasibleGoal != null && feasibleGoal > 0 && projectedRevenue >= feasibleGoal) {
      return "yellow";
    } else if (feasibleGoal != null && feasibleGoal > 0 && projectedRevenue >= feasibleGoal * 0.8 && projectedRevenue < feasibleGoal) {
      return "red";
    } else {
      return "purple";
    }
  };

  const performanceData = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      noColor: 0
    };
    const underperformingShops: any[] = [];
    const personnelIds = new Set();

    monthlyShopTotals.forEach(shop => {
      // Add personnel_id if exists, otherwise use a combination of shop info to identify unique personnel
      if (shop.personnel_id) {
        personnelIds.add(shop.personnel_id);
      } else if (shop.personnel_name) {
        // Use personnel name as fallback identifier
        personnelIds.add(shop.personnel_name);
      }
      console.log('Personnel data:', { shop: shop.shop_name, personnel_id: shop.personnel_id, personnel_name: shop.personnel_name });

      const category = getShopColorCategory(shop);
      switch (category) {
        case 'green':
          colorCounts.green++;
          break;
        case 'yellow':
          colorCounts.yellow++;
          break;
        case 'red':
          colorCounts.red++;
          break;
        case 'purple':
          colorCounts.purple++;
          if (shop.feasible_goal && shop.feasible_goal > 0) {
            underperformingShops.push({
              shop_name: shop.shop_name,
              total_revenue: shop.total_revenue,
              projected_revenue: shop.projected_revenue,
              feasible_goal: shop.feasible_goal,
              breakthrough_goal: shop.breakthrough_goal,
              deficit: Math.max(0, (shop.feasible_goal || 0) - shop.projected_revenue),
            });
          }
          break;
        case 'no-color':
          colorCounts.noColor++;
          break;
      }
    });

    const pieData = [
      { name: 'Đột phá', value: colorCounts.green },
      { name: 'Khả thi', value: colorCounts.yellow },
      { name: 'Gần đạt', value: colorCounts.red },
      { name: 'Chưa đạt', value: colorCounts.purple },
      { name: 'Chưa có mục tiêu', value: colorCounts.noColor },
    ];

    return {
      totalShops: total,
      totalEmployees: personnelIds.size,
      breakthroughMet: colorCounts.green,
      feasibleOnlyMet: colorCounts.yellow,
      almostMet: colorCounts.red,
      notMet80Percent: colorCounts.purple,
      underperformingShops,
      pieData,
    };
  }, [monthlyShopTotals, getShopColorCategory]);

  const leaderPerformanceData = useMemo(() => {
    console.log('🔍 [SalesDashboard] monthlyShopTotals sample:', monthlyShopTotals.slice(0, 2));
    console.log('🔍 [SalesDashboard] leaders data:', leaders);
    
    if (!monthlyShopTotals.length) return [];

    const leaderStats: Record<string, any> = {};
    
    // Initialize stats for all leaders
    leaders.forEach(leader => {
      leaderStats[leader.id] = {
        leader_name: leader.name,
        shop_count: 0,
        personnel_count: 0,
        breakthroughMet: 0,
        feasibleMet: 0,
        almostMet: 0,
        notMet: 0,
        withoutGoals: 0,
      };
    });

    // Add a category for shops without a leader
    const NO_LEADER_KEY = 'no-leader';
    leaderStats[NO_LEADER_KEY] = {
      leader_name: "Chưa có Leader",
      shop_count: 0,
      personnel_count: 0,
      breakthroughMet: 0,
      feasibleMet: 0,
      almostMet: 0,
      notMet: 0,
      withoutGoals: 0,
    };

    // Calculate personnel and shop counts by leader
    const personnelByLeader = new Map<string, Set<string>>();
    const shopsByLeader = new Map<string, Set<string>>();

    monthlyShopTotals.forEach(shop => {
      // Use leader_name to map to leader_id from leaders array
      const leader = leaders.find(l => l.name === shop.leader_name);
      const leaderId = leader?.id || NO_LEADER_KEY;
      
      console.log('🔍 [SalesDashboard] Shop-Leader mapping:', { 
        shopName: shop.shop_name, 
        leaderName: shop.leader_name, 
        foundLeader: !!leader,
        leaderId 
      });
      
      if (!shopsByLeader.has(leaderId)) {
        shopsByLeader.set(leaderId, new Set());
      }
      shopsByLeader.get(leaderId)!.add(shop.shop_id);

      if (shop.personnel_id) {
        if (!personnelByLeader.has(leaderId)) {
          personnelByLeader.set(leaderId, new Set());
        }
        personnelByLeader.get(leaderId)!.add(shop.personnel_id);
      } else if (shop.personnel_name) {
        if (!personnelByLeader.has(leaderId)) {
          personnelByLeader.set(leaderId, new Set());
        }
        personnelByLeader.get(leaderId)!.add(shop.personnel_name);
      }

      const stats = leaderStats[leaderId] || leaderStats[NO_LEADER_KEY];
      const category = getShopColorCategory(shop);

      switch (category) {
        case 'green':
          stats.breakthroughMet++;
          break;
        case 'yellow':
          stats.feasibleMet++;
          break;
        case 'red':
          stats.almostMet++;
          break;
        case 'purple':
          stats.notMet++;
          break;
        case 'no-color':
          stats.withoutGoals++;
          break;
      }
    });

    Object.keys(leaderStats).forEach(leaderId => {
      leaderStats[leaderId].shop_count = shopsByLeader.get(leaderId)?.size || 0;
      leaderStats[leaderId].personnel_count = personnelByLeader.get(leaderId)?.size || 0;
    });

    const result = Object.values(leaderStats).filter(stats => stats.shop_count > 0);
    
    console.log('🔍 [SalesDashboard] Final leader performance data:', result);

    return result;
  }, [monthlyShopTotals, leaders, getShopColorCategory]);

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
            <StatCard title="Tổng số shop vận hành" value={performanceData.totalShops} icon={Store} />
            <StatCard title="🟩 Đạt đột phá" value={performanceData.breakthroughMet} icon={Award} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" />
            <StatCard title="🟨 Đạt khả thi" value={performanceData.feasibleOnlyMet} icon={CheckCircle} className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" />
            <StatCard title="🟥 Gần đạt (80-99%)" value={performanceData.almostMet} icon={Target} className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" />
            <Card className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">🟪 Chưa đạt 80%</CardTitle>
                <AlertTriangle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{performanceData.notMet80Percent}</div>
              </CardContent>
            </Card>
            <StatCard title="Nhân viên vận hành" value={performanceData.totalEmployees} icon={Users} />
          </div>

          <PerformancePieChart data={performanceData.pieData} title="Phân bố hiệu suất" />
          
          <LeaderPerformanceDashboard data={leaderPerformanceData} />
          
          <LeaderPerformanceChart data={leaderPerformanceData} />
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