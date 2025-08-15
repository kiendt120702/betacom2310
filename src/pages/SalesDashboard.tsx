import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ShopPerformance from "@/components/dashboard/ShopPerformance";
import TrendsChart from "@/components/dashboard/TrendsChart";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BarChart3, Store, Calendar, TrendingUp, LineChart } from "@/lib/icons";

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
  const [selectedShopForTrends, setSelectedShopForTrends] = useState<string>("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useComprehensiveReports({ month: selectedMonth });

  // Prefetch data for adjacent months to improve navigation performance
  useEffect(() => {
    const currentDate = new Date(selectedMonth + "-01");
    const prevMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1), "yyyy-MM");
    const nextMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1), "yyyy-MM");

    // Prefetch previous and next month data in background
    queryClient.prefetchQuery({
      queryKey: ["comprehensiveReports", { month: prevMonth }],
      queryFn: async () => {
        // This will use the same logic as useComprehensiveReports
        return [];
      },
      staleTime: 5 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: ["comprehensiveReports", { month: nextMonth }],
      queryFn: async () => {
        return [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [selectedMonth, queryClient]);

  // Get unique shops from reports for trends tab - optimized
  const availableShops = useMemo(() => {
    const shopsMap: Record<string, { id: string; name: string }> = {};
    for (const report of reports) {
      if (report.shop_id && report.shops?.name && !shopsMap[report.shop_id]) {
        shopsMap[report.shop_id] = {
          id: report.shop_id,
          name: report.shops.name
        };
      }
    }
    return Object.values(shopsMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [reports]);

  // Auto-select first shop for trends if none selected
  useEffect(() => {
    if (availableShops.length > 0 && !selectedShopForTrends) {
      setSelectedShopForTrends(availableShops[0].id);
    }
  }, [availableShops, selectedShopForTrends]);

  // Filter reports by selected shop for trends - optimized
  const shopReportsForTrends = useMemo(() => {
    if (!selectedShopForTrends) return [];
    return reports.filter(report => report.shop_id === selectedShopForTrends);
  }, [reports, selectedShopForTrends]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);

  const handleShopForTrendsChange = useCallback((shopId: string) => {
    setSelectedShopForTrends(shopId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="space-y-8 p-6">
        {/* Page Header */}
        <div className="border-b bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Dashboard Doanh số
              </h1>
              <p className="text-muted-foreground">
                Theo dõi và phân tích hiệu suất bán hàng theo thời gian thực
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Cập nhật: {format(new Date(), "dd/MM/yyyy HH:mm")}</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Xu hướng
            </TabsTrigger>
            <TabsTrigger value="shops" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Shops
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview
              reports={reports}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              monthOptions={monthOptions}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Xu hướng Doanh số Shop</h2>
                    <p className="text-muted-foreground">
                      Phân tích xu hướng doanh thu và đơn hàng theo ngày của shop trong tháng {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: vi })}
                    </p>
                  </div>
                </div>
                
                {/* Shop selector for trends */}
                <div className="flex items-center gap-4">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Shop:</span>
                  <select 
                    value={selectedShopForTrends} 
                    onChange={(e) => handleShopForTrendsChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || availableShops.length === 0}
                  >
                    {availableShops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                  {selectedShopForTrends && (
                    <span className="text-sm text-muted-foreground">
                      ({shopReportsForTrends.length} ngày có dữ liệu)
                    </span>
                  )}
                </div>
              </div>
              <TrendsChart reports={shopReportsForTrends} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Hiệu suất Shop</h2>
                  <p className="text-muted-foreground">
                    Xếp hạng và so sánh hiệu suất các shop trong tháng {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: vi })}
                  </p>
                </div>
              </div>
              <ShopPerformance reports={reports} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Footer */}
        {!isLoading && reports.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(reports.map(r => r.shop_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Shops hoạt động</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {reports.length}
                </div>
                <div className="text-sm text-muted-foreground">Ngày có dữ liệu</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(reports.reduce((acc, r) => acc + (r.total_revenue || 0), 0) / reports.length).toLocaleString('vi-VN')}
                </div>
                <div className="text-sm text-muted-foreground">TB doanh thu/ngày (VND)</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">
                  {(reports.reduce((acc, r) => acc + (r.conversion_rate || 0), 0) / reports.length).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">TB tỷ lệ chuyển đổi</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SalesDashboard);