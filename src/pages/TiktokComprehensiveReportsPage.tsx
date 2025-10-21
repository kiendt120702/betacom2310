import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTiktokComprehensiveReportData } from "@/hooks/useTiktokComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";
import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { generateMonthOptions } from "@/utils/revenueUtils";
import TiktokComprehensiveReportTable from '@/components/tiktok-shops/TiktokComprehensiveReportTable';
import ReportLegend from '@/components/reports/ReportLegend';
import UnderperformingShopsDialog from '@/components/dashboard/UnderperformingShopsDialog';
import TiktokReportStats from '@/components/tiktok-shops/TiktokReportStats';
import TiktokReportFilters from '@/components/tiktok-shops/TiktokReportFilters';
import TiktokReportUploaderSection from '@/components/tiktok-shops/TiktokReportUploaderSection';

const TiktokComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);

  const { isLoading, monthlyShopTotals } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel,
    debouncedSearchTerm,
    sortConfig: null,
  });

  const getShopColorCategory = (shopData: any) => {
    const projectedRevenue = shopData.projected_revenue || 0;
    const feasibleGoal = shopData.feasible_goal;
    const breakthroughGoal = shopData.breakthrough_goal;

    if (projectedRevenue <= 0) return "no-color";
    if (feasibleGoal == null && breakthroughGoal == null) return "no-color";
    if (feasibleGoal === 0) return "no-color";
    if (breakthroughGoal != null && projectedRevenue > breakthroughGoal) return "green";
    if (feasibleGoal != null && feasibleGoal > 0 && projectedRevenue >= feasibleGoal) return "yellow";
    if (feasibleGoal != null && feasibleGoal > 0 && projectedRevenue >= feasibleGoal * 0.8 && projectedRevenue < feasibleGoal) return "red";
    return "purple";
  };

  const performanceData = useMemo(() => {
    const total = monthlyShopTotals.length;
    const colorCounts = { green: 0, yellow: 0, red: 0, purple: 0, noColor: 0 };
    const underperformingShops: any[] = [];

    monthlyShopTotals.forEach((shop) => {
      const category = getShopColorCategory(shop);
      switch (category) {
        case "green": colorCounts.green++; break;
        case "yellow": colorCounts.yellow++; break;
        case "red": colorCounts.red++; break;
        case "purple":
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
        case "no-color": colorCounts.noColor++; break;
      }
    });

    return {
      totalShops: total,
      breakthroughMet: colorCounts.green,
      feasibleOnlyMet: colorCounts.yellow,
      almostMet: colorCounts.red,
      notMet80Percent: colorCounts.purple,
      underperformingShops,
    };
  }, [monthlyShopTotals]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <TiktokReportStats 
        performanceData={performanceData} 
        onUnderperformingClick={() => setIsUnderperformingDialogOpen(true)} 
      />
      <ReportLegend />
      <TiktokReportUploaderSection />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">
                Báo Cáo Tổng Hợp Theo Shop
              </CardTitle>
            </div>
          </div>
          <TiktokReportFilters
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthOptions={monthOptions}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Đang tải báo cáo...</p>
              </div>
            </div>
          }>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Đang tải dữ liệu cho tháng {selectedMonth}...
                  </span>
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <TiktokComprehensiveReportTable reports={monthlyShopTotals} />
            )}
          </Suspense>
        </CardContent>
      </Card>
      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />
    </div>
  );
};

export default TiktokComprehensiveReportsPage;