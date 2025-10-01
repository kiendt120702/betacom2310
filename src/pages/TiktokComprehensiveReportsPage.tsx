import React, { useState, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTiktokComprehensiveReportData } from "@/hooks/useTiktokComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";
import { Calendar, BarChart3, Store, ChevronsUpDown, Check, Search, Users, Target, AlertTriangle, Award, CheckCircle, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { generateMonthOptions } from "@/utils/revenueUtils";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import TiktokComprehensiveReportTable from '@/components/tiktok-shops/TiktokComprehensiveReportTable';
import StatCard from '@/components/dashboard/StatCard';
import ReportLegend from '@/components/reports/ReportLegend';
import UnderperformingShopsDialog from '@/components/dashboard/UnderperformingShopsDialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TiktokComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useTiktokComprehensiveReportData({
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          title="Đỏ"
          value={performanceData.almostMet}
          icon={Target}
          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        />
        <Card
          className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
          onClick={() => setIsUnderperformingDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tím
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {performanceData.notMet80Percent}
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportLegend />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">
                Báo Cáo Tổng Hợp Theo Shop
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => navigate('/tiktok-monthly-report-upload')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Báo Cáo Tháng
                </Button>
                <Button variant="outline" onClick={() => navigate('/tiktok-cancelled-revenue-upload')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Doanh Số Hủy
                </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
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
            <div className="flex items-center gap-2">
              <Label htmlFor="search" className="sr-only">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Tìm kiếm shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
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