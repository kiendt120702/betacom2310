import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { useTiktokComprehensiveReportData } from "@/hooks/useTiktokComprehensiveReportData";
import { useMonthOptions } from "@/hooks/useMonthOptions";
import { getShopColorCategory } from "@/utils/reportUtils";
import GenericSalesDashboard from "@/components/dashboard/GenericSalesDashboard";

const TiktokSalesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const monthOptions = useMonthOptions();

  const { isLoading, monthlyShopTotals } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel: "all",
    debouncedSearchTerm: "",
    sortConfig: null,
  });

  const performanceData = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = { green: 0, yellow: 0, red: 0, purple: 0, noColor: 0 };
    const underperformingShops: any[] = [];
    const personnelIds = new Set();
    const personnelBreakthrough = new Set();
    const personnelFeasible = new Set();
    const personnelBreakthroughDetails: { [key: string]: any } = {};
    const personnelFeasibleDetails: { [key: string]: any } = {};

    monthlyShopTotals.forEach((shop) => {
      const personnelKey = shop.personnel_id || shop.personnel_name;
      if (personnelKey) personnelIds.add(personnelKey);

      const category = getShopColorCategory(shop);
      switch (category) {
        case "green":
          colorCounts.green++;
          if (personnelKey) {
            personnelBreakthrough.add(personnelKey);
            personnelFeasible.add(personnelKey);
            if (!personnelBreakthroughDetails[personnelKey]) personnelBreakthroughDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelBreakthroughDetails[personnelKey].shop_names.push(shop.shop_name);
            if (!personnelFeasibleDetails[personnelKey]) personnelFeasibleDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelFeasibleDetails[personnelKey].shop_names.push(shop.shop_name);
          }
          break;
        case "yellow":
          colorCounts.yellow++;
          if (personnelKey) {
            personnelFeasible.add(personnelKey);
            if (!personnelFeasibleDetails[personnelKey]) personnelFeasibleDetails[personnelKey] = { personnel_name: shop.personnel_name, leader_name: shop.leader_name || "Chưa có Leader", shop_names: [] };
            personnelFeasibleDetails[personnelKey].shop_names.push(shop.shop_name);
          }
          break;
        case "red": colorCounts.red++; break;
        case "purple":
          colorCounts.purple++;
          if (shop.feasible_goal && shop.feasible_goal > 0) underperformingShops.push({ shop_name: shop.shop_name, total_revenue: shop.total_revenue, projected_revenue: shop.projected_revenue, feasible_goal: shop.feasible_goal, breakthrough_goal: shop.breakthrough_goal, deficit: Math.max(0, (shop.feasible_goal || 0) - shop.projected_revenue) });
          break;
        case "no-color": colorCounts.noColor++; break;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            TikTok Dashboard
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
      <GenericSalesDashboard isLoading={isLoading} performanceData={performanceData} />
    </div>
  );
};

export default TiktokSalesDashboard;