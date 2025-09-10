import React, { useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import StatCard from "@/components/dashboard/StatCard";
import { useComprehensiveReportDataRefactored } from "@/hooks/useComprehensiveReportDataRefactored";
import { useReportFilters } from "@/hooks/useReportFilters";
import { generateMonthOptions } from "@/utils/revenueUtils";
import type { ShopReportData, ColorCategory, ShopStatus } from "@/types/reports";
import {
  Store,
  Award,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3,
  Activity,
  Plus,
  StopCircle,
} from "lucide-react";

const ComprehensiveReportsPage = () => {
  // Use centralized filter management
  const {
    filters,
    sortConfig,
    openStates: { openLeaderSelector, openPersonnelSelector },
    updateFilter,
    setSortConfig,
    setOpenLeaderSelector,
    setOpenPersonnelSelector,
    clearFilters,
    activeFiltersCount
  } = useReportFilters();

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  // Use refactored data hook
  const { isLoading, monthlyShopTotals, leaders, personnelOptions } =
    useComprehensiveReportDataRefactored({
      filters,
      sortConfig,
    });


  // Memoized functions for better performance
  const requestSort = useCallback((key: "total_revenue") => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  }, [sortConfig, setSortConfig]);

  // Memoized shop status function
  const getShopStatus = useCallback((shopData: ShopReportData): ShopStatus => {
    return shopData.shop_status || "Chưa có";
  }, []);

  // Memoized color category function
  const getShopColorCategory = useCallback((shopData: ShopReportData): ColorCategory => {
    const projectedRevenue = shopData.projected_revenue || 0;
    const feasibleGoal = shopData.feasible_goal;
    const breakthroughGoal = shopData.breakthrough_goal;

    if (
      feasibleGoal == null ||
      breakthroughGoal == null ||
      projectedRevenue <= 0
    ) {
      return "no-color";
    }

    if (feasibleGoal === 0) {
      return "no-color";
    }

    if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
      return "green";
    } else if (projectedRevenue >= feasibleGoal) {
      return "yellow";
    } else if (
      projectedRevenue >= feasibleGoal * 0.8 &&
      projectedRevenue < feasibleGoal
    ) {
      return "red";
    } else {
      return "purple";
    }
  }, []);

  // Data is already filtered in the refactored hook
  const filteredData = monthlyShopTotals;

  // Calculate statistics with stable dependencies
  const statistics = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      noColor: 0,
    };
    
    const statusCounts = {
      "Đang Vận Hành": 0,
      "Shop mới": 0,
      "Đã Dừng": 0,
    };

    monthlyShopTotals.forEach((shop) => {
      // Count by color category
      const category = getShopColorCategory(shop);
      switch (category) {
        case "green":
          colorCounts.green++;
          break;
        case "yellow":
          colorCounts.yellow++;
          break;
        case "red":
          colorCounts.red++;
          break;
        case "purple":
          colorCounts.purple++;
          break;
        case "no-color":
          colorCounts.noColor++;
          break;
      }
      
      // Count by status
      const status = getShopStatus(shop);
      
      switch (status) {
        case "Đang Vận Hành":
          statusCounts["Đang Vận Hành"]++;
          break;
        case "Shop mới":
          statusCounts["Shop mới"]++;
          break;
        case "Đã Dừng":
          statusCounts["Đã Dừng"]++;
          break;
      }
    });

    return {
      total,
      ...colorCounts,
      ...statusCounts,
    };
  }, [monthlyShopTotals]);  // Stable dependencies - functions are memoized

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Tổng số shop vận hành"
          value={statistics.total}
          icon={Store}
        />
        <StatCard
          title="Shop đạt đột phá"
          value={statistics.green}
          icon={Award}
          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        />
        <StatCard
          title="Shop đạt khả thi"
          value={statistics.yellow}
          icon={CheckCircle}
          className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
        />
        <StatCard
          title="Đỏ"
          value={statistics.red}
          icon={Target}
          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        />
        <StatCard
          title="Tím"
          value={statistics.purple}
          icon={AlertTriangle}
          className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload báo cáo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiDayReportUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Chú thích màu sắc
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Xanh lá:
                </span>
                <span className="text-muted-foreground ml-1">
                  Doanh số dự kiến &gt; Mục tiêu đột phá
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-100 border-2 border-yellow-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Vàng:
                </span>
                <span className="text-muted-foreground ml-1">
                  Mục tiêu khả thi &lt; Doanh số dự kiến &lt; Mục tiêu đột phá
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-red-800 dark:text-red-200">
                  Đỏ:
                </span>
                <span className="text-muted-foreground ml-1">
                  80% Mục tiêu khả thi &lt; Doanh số dự kiến &lt; 99% Mục tiêu
                  khả thi
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-purple-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-purple-800 dark:text-purple-200">
                  Tím:
                </span>
                <span className="text-muted-foreground ml-1">
                  Doanh số dự kiến &lt; 80% Mục tiêu khả thi
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <ReportFilters
            selectedMonth={filters.selectedMonth}
            onMonthChange={(value) => updateFilter('selectedMonth', value)}
            monthOptions={monthOptions}
            selectedLeader={filters.selectedLeader}
            onLeaderChange={(value) => updateFilter('selectedLeader', value)}
            leaders={leaders}
            isLeaderSelectorOpen={openLeaderSelector}
            onLeaderSelectorOpenChange={setOpenLeaderSelector}
            selectedPersonnel={filters.selectedPersonnel}
            onPersonnelChange={(value) => updateFilter('selectedPersonnel', value)}
            personnelOptions={personnelOptions}
            isPersonnelSelectorOpen={openPersonnelSelector}
            onPersonnelSelectorOpenChange={setOpenPersonnelSelector}
            searchTerm={filters.searchTerm}
            onSearchTermChange={(value) => updateFilter('searchTerm', value)}
            selectedColorFilter={filters.selectedColorFilter}
            onColorFilterChange={(value) => updateFilter('selectedColorFilter', value)}
            selectedStatusFilter={filters.selectedStatusFilter}
            onStatusFilterChange={(value) => updateFilter('selectedStatusFilter', value)}
            isLoading={isLoading}
            onClearFilters={clearFilters}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <ReportTable
              data={filteredData}
              sortConfig={sortConfig}
              requestSort={requestSort}
              getShopStatus={getShopStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;
