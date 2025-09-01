import React, { useState, useMemo } from "react";
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
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";
import { generateMonthOptions } from "@/utils/revenueUtils";
import {
  Store,
  Award,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3,
} from "lucide-react";

const ComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "total_revenue";
    direction: "asc" | "desc";
  } | null>(null);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColorFilter, setSelectedColorFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } =
    useComprehensiveReportData({
      selectedMonth,
      selectedLeader,
      selectedPersonnel,
      debouncedSearchTerm,
      sortConfig,
    });

  const requestSort = (key: "total_revenue") => {
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
  };

  const handleClearFilters = () => {
    setSelectedMonth(format(new Date(), "yyyy-MM"));
    setSelectedLeader("all");
    setSelectedPersonnel("all");
    setSearchTerm("");
    setSelectedColorFilter("all");
    setSortConfig(null);
  };

  // Function to determine color category of a shop (only colored cells count)
  const getShopColorCategory = (shopData: any) => {
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
  };

  // Filter data by color category
  const colorFilteredData = useMemo(() => {
    if (selectedColorFilter === "all") return monthlyShopTotals;

    return monthlyShopTotals.filter((shop) => {
      const colorCategory = getShopColorCategory(shop);
      return colorCategory === selectedColorFilter;
    });
  }, [monthlyShopTotals, selectedColorFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      noColor: 0,
    };

    monthlyShopTotals.forEach((shop) => {
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
    });

    return {
      total,
      ...colorCounts,
    };
  }, [monthlyShopTotals, getShopColorCategory]);

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
        <StatCard
          title="Chưa điền mục tiêu"
          value={statistics.noColor}
          icon={BarChart3}
          className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
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
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthOptions={monthOptions}
            selectedLeader={selectedLeader}
            onLeaderChange={setSelectedLeader}
            leaders={leaders}
            isLeaderSelectorOpen={openLeaderSelector}
            onLeaderSelectorOpenChange={setOpenLeaderSelector}
            selectedPersonnel={selectedPersonnel}
            onPersonnelChange={setSelectedPersonnel}
            personnelOptions={personnelOptions}
            isPersonnelSelectorOpen={openPersonnelSelector}
            onPersonnelSelectorOpenChange={setOpenPersonnelSelector}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedColorFilter={selectedColorFilter}
            onColorFilterChange={setSelectedColorFilter}
            isLoading={isLoading}
            onClearFilters={handleClearFilters}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <ReportTable
              data={colorFilteredData}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;
