import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import PersonnelAchievementModal from "@/components/dashboard/PersonnelAchievementModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BarChart3,
  Store,
  Users,
  Target,
  AlertTriangle,
  Award,
  CheckCircle,
} from "lucide-react";
import { useComprehensiveReportDataRefactored as useComprehensiveReportData } from "@/hooks/useComprehensiveReportDataRefactored";
import PerformanceBarChart from "@/components/dashboard/PerformanceBarChart";
import { generateMonthOptions } from "@/utils/revenueUtils";
import ShopDialog from "@/components/admin/ShopDialog";

const SalesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] =
    useState(false);
  const [isBreakthroughModalOpen, setIsBreakthroughModalOpen] = useState(false);
  const [isFeasibleModalOpen, setIsFeasibleModalOpen] = useState(false);
  const [selectedLeaderForModal, setSelectedLeaderForModal] = useState<
    string | null
  >(null);

  const { isLoading, monthlyShopTotals, leaders } = useComprehensiveReportData({
    filters: {
      selectedMonth,
      selectedLeader: "all",
      selectedPersonnel: "all",
      searchTerm: "",
      selectedColorFilter: "all",
      selectedStatusFilter: [],
    },
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
    } else if (
      feasibleGoal != null &&
      feasibleGoal > 0 &&
      projectedRevenue >= feasibleGoal
    ) {
      return "yellow";
    } else if (
      feasibleGoal != null &&
      feasibleGoal > 0 &&
      projectedRevenue >= feasibleGoal * 0.8 &&
      projectedRevenue < feasibleGoal
    ) {
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
      noColor: 0,
    };
    const underperformingShops: any[] = [];
    const personnelIds = new Set();
    const personnelBreakthrough = new Set();
    const personnelFeasible = new Set();
    const personnelBreakthroughDetails: {
      [key: string]: {
        personnel_name: string;
        leader_name: string;
        shop_names: string[];
      };
    } = {};
    const personnelFeasibleDetails: {
      [key: string]: {
        personnel_name: string;
        leader_name: string;
        shop_names: string[];
      };
    } = {};

    monthlyShopTotals.forEach((shop) => {
      // Add personnel_id if exists, otherwise use a combination of shop info to identify unique personnel
      const personnelKey = shop.personnel_id || shop.personnel_name;
      if (personnelKey) {
        personnelIds.add(personnelKey);
      }

      const category = getShopColorCategory(shop);
      switch (category) {
        case "green":
          colorCounts.green++;
          if (personnelKey) {
            personnelBreakthrough.add(personnelKey);
            personnelFeasible.add(personnelKey);

            // Track breakthrough details
            if (!personnelBreakthroughDetails[personnelKey]) {
              personnelBreakthroughDetails[personnelKey] = {
                personnel_name: shop.personnel_name,
                leader_name: shop.leader_name || "Chưa có Leader",
                shop_names: [],
              };
            }
            personnelBreakthroughDetails[personnelKey].shop_names.push(
              shop.shop_name
            );

            // Track feasible details
            if (!personnelFeasibleDetails[personnelKey]) {
              personnelFeasibleDetails[personnelKey] = {
                personnel_name: shop.personnel_name,
                leader_name: shop.leader_name || "Chưa có Leader",
                shop_names: [],
              };
            }
            personnelFeasibleDetails[personnelKey].shop_names.push(
              shop.shop_name
            );
          }
          break;
        case "yellow":
          colorCounts.yellow++;
          if (personnelKey) {
            personnelFeasible.add(personnelKey);

            // Track feasible details
            if (!personnelFeasibleDetails[personnelKey]) {
              personnelFeasibleDetails[personnelKey] = {
                personnel_name: shop.personnel_name,
                leader_name: shop.leader_name || "Chưa có Leader",
                shop_names: [],
              };
            }
            personnelFeasibleDetails[personnelKey].shop_names.push(
              shop.shop_name
            );
          }
          break;
        case "red":
          colorCounts.red++;
          break;
        case "purple":
          colorCounts.purple++;
          if (shop.feasible_goal && shop.feasible_goal > 0) {
            underperformingShops.push({
              shop_name: shop.shop_name,
              total_revenue: shop.total_revenue,
              projected_revenue: shop.projected_revenue,
              feasible_goal: shop.feasible_goal,
              breakthrough_goal: shop.breakthrough_goal,
              deficit: Math.max(
                0,
                (shop.feasible_goal || 0) - shop.projected_revenue
              ),
            });
          }
          break;
        case "no-color":
          colorCounts.noColor++;
          break;
      }
    });

    const pieData = [
      { name: "Đột phá", value: colorCounts.green },
      { name: "Khả thi", value: colorCounts.yellow },
      { name: "Gần đạt", value: colorCounts.red },
      { name: "Chưa đạt", value: colorCounts.purple },
    ].filter(item => item.value > 0);


    return {
      totalShops: total,
      totalEmployees: personnelIds.size,
      personnelBreakthrough: personnelBreakthrough.size,
      personnelFeasible: personnelFeasible.size,
      breakthroughMet: colorCounts.green,
      feasibleOnlyMet: colorCounts.yellow,
      almostMet: colorCounts.red,
      notMet80Percent: colorCounts.purple,
      underperformingShops,
      pieData,
      personnelBreakthroughDetails: Object.values(personnelBreakthroughDetails),
      personnelFeasibleDetails: Object.values(personnelFeasibleDetails),
    };
  }, [monthlyShopTotals]);

  // Removed leaderPerformanceData as it's no longer needed

  // Create leader-specific personnel data for modals
  const getLeaderPersonnelData = (
    leaderName: string,
    type: "breakthrough" | "feasible"
  ) => {
    const leaderShops = monthlyShopTotals.filter(
      (shop) => shop.leader_name === leaderName
    );
    const personnelData: {
      [key: string]: {
        personnel_name: string;
        leader_name: string;
        shop_names: string[];
      };
    } = {};

    leaderShops.forEach((shop) => {
      const personnelKey = shop.personnel_id || shop.personnel_name;
      if (!personnelKey) return;

      const category = getShopColorCategory(shop);
      const shouldInclude =
        type === "breakthrough"
          ? category === "green"
          : category === "green" || category === "yellow";

      if (shouldInclude) {
        if (!personnelData[personnelKey]) {
          personnelData[personnelKey] = {
            personnel_name: shop.personnel_name,
            leader_name: shop.leader_name || "Chưa có Leader",
            shop_names: [],
          };
        }
        personnelData[personnelKey].shop_names.push(shop.shop_name);
      }
    });

    return Object.values(personnelData);
  };

  const handleLeaderBreakthroughClick = (leaderName: string) => {
    setSelectedLeaderForModal(leaderName);
    setIsBreakthroughModalOpen(true);
  };

  const handleLeaderFeasibleClick = (leaderName: string) => {
    setSelectedLeaderForModal(leaderName);
    setIsFeasibleModalOpen(true);
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
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
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
            <StatCard
              title="Tổng số shop vận hành"
              value={performanceData.totalShops}
              icon={Store}
            />
            <StatCard
              title="Shop đạt đột phá"
              value={performanceData.breakthroughMet}
              icon={Award}
              className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            />
            <StatCard
              title="Shop đạt khả thi"
              value={performanceData.breakthroughMet + performanceData.feasibleOnlyMet}
              icon={CheckCircle}
              className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            />
            <StatCard
              title="Khả thi gần đạt (80-99%)"
              value={performanceData.almostMet}
              icon={Target}
              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            />
            <Card
              className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
              onClick={() => setIsUnderperformingDialogOpen(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Shop khả thi chưa đạt 80%
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {performanceData.notMet80Percent}
                </div>
              </CardContent>
            </Card>
            <StatCard
              title="Nhân viên vận hành"
              value={performanceData.totalEmployees}
              icon={Users}
            />
          </div>

          <PerformanceBarChart
            data={performanceData.pieData}
            title="Phân bố hiệu suất"
            personnelBreakthrough={performanceData.personnelBreakthrough}
            personnelFeasible={performanceData.personnelFeasible}
            totalPersonnel={performanceData.totalEmployees}
            onBreakthroughClick={() => setIsBreakthroughModalOpen(true)}
            onFeasibleClick={() => setIsFeasibleModalOpen(true)}
          />
        </>
      )}

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />

      <PersonnelAchievementModal
        isOpen={isBreakthroughModalOpen}
        onOpenChange={(open) => {
          setIsBreakthroughModalOpen(open);
          if (!open) setSelectedLeaderForModal(null);
        }}
        title={
          selectedLeaderForModal
            ? `Nhân sự đạt đột phá - ${selectedLeaderForModal}`
            : "Nhân sự đạt đột phá"
        }
        personnelData={
          selectedLeaderForModal
            ? getLeaderPersonnelData(selectedLeaderForModal, "breakthrough")
            : performanceData.personnelBreakthroughDetails
        }
      />

      <PersonnelAchievementModal
        isOpen={isFeasibleModalOpen}
        onOpenChange={(open) => {
          setIsFeasibleModalOpen(open);
          if (!open) setSelectedLeaderForModal(null);
        }}
        title={
          selectedLeaderForModal
            ? `Nhân sự đạt khả thi - ${selectedLeaderForModal}`
            : "Nhân sự đạt khả thi"
        }
        personnelData={
          selectedLeaderForModal
            ? getLeaderPersonnelData(selectedLeaderForModal, "feasible")
            : performanceData.personnelFeasibleDetails
        }
      />
    </div>
  );
};

export default SalesDashboard;