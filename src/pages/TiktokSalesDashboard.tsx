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
import GenericSalesDashboard from "@/components/dashboard/GenericSalesDashboard";
import { usePerformanceAnalytics } from "@/hooks/usePerformanceAnalytics";

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

  const performanceData = usePerformanceAnalytics(monthlyShopTotals);

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