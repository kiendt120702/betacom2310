import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import StatCard from "./StatCard";
import QuickInsights from "./QuickInsights";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Eye,
  RotateCcw,
  UserCheck,
  Percent,
  Store,
  ChevronsUpDown,
  Check
} from "lucide-react";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  reports: ComprehensiveReport[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthOptions: { value: string; label: string }[];
  isLoading: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  reports,
  selectedMonth,
  onMonthChange,
  monthOptions,
  isLoading,
}) => {
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [openShopSelector, setOpenShopSelector] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Get unique shops from reports
  const availableShops = useMemo(() => {
    const shopsMap = new Map<string, { id: string; name: string }>();
    reports.forEach(report => {
      if (report.shop_id && report.shops?.name) {
        shopsMap.set(report.shop_id, {
          id: report.shop_id,
          name: report.shops.name
        });
      }
    });
    return Array.from(shopsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [reports]);

  // Auto-select first shop if none selected
  React.useEffect(() => {
    if (availableShops.length > 0 && !selectedShop) {
      setSelectedShop(availableShops[0].id);
    }
  }, [availableShops, selectedShop]);

  // Filter reports by selected shop
  const shopReports = useMemo(() => {
    if (!selectedShop) return [];
    return reports.filter(report => report.shop_id === selectedShop);
  }, [reports, selectedShop]);

  const shopData = useMemo(() => {
    if (!shopReports || shopReports.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalVisits: 0,
        conversionRate: 0,
        totalBuyers: 0,
        newBuyers: 0,
        existingBuyers: 0,
        buyerReturnRate: 0,
        cancelledOrders: 0,
        cancelledRevenue: 0,
        returnedOrders: 0,
        returnedRevenue: 0,
        shopName: "",
        personnelName: "",
        leaderName: "",
        daysActive: 0,
      };
    }

    const summed = shopReports.reduce((acc, report) => {
      acc.totalRevenue += report.total_revenue || 0;
      acc.totalOrders += report.total_orders || 0;
      acc.totalVisits += report.total_visits || 0;
      acc.totalBuyers += report.total_buyers || 0;
      acc.newBuyers += report.new_buyers || 0;
      acc.existingBuyers += report.existing_buyers || 0;
      acc.cancelledOrders += report.cancelled_orders || 0;
      acc.cancelledRevenue += report.cancelled_revenue || 0;
      acc.returnedOrders += report.returned_orders || 0;
      acc.returnedRevenue += report.returned_revenue || 0;
      return acc;
    }, {
      totalRevenue: 0,
      totalOrders: 0,
      totalVisits: 0,
      totalBuyers: 0,
      newBuyers: 0,
      existingBuyers: 0,
      cancelledOrders: 0,
      cancelledRevenue: 0,
      returnedOrders: 0,
      returnedRevenue: 0,
    });

    const firstReport = shopReports[0];
    
    return {
      ...summed,
      averageOrderValue: summed.totalOrders > 0 ? summed.totalRevenue / summed.totalOrders : 0,
      conversionRate: summed.totalVisits > 0 ? (summed.totalOrders / summed.totalVisits) * 100 : 0,
      buyerReturnRate: summed.totalBuyers > 0 ? (summed.existingBuyers / summed.totalBuyers) * 100 : 0,
      shopName: firstReport?.shops?.name || "",
      personnelName: firstReport?.shops?.personnel?.name || "",
      leaderName: firstReport?.shops?.leader?.name || "",
      daysActive: shopReports.length,
    };
  }, [shopReports]);

  const selectedShopInfo = availableShops.find(shop => shop.id === selectedShop);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month and Shop Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Báo cáo Shop</h2>
            <p className="text-muted-foreground">
              Hiệu suất shop trong tháng {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: vi })}
            </p>
          </div>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shop Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Chọn shop:</span>
          </div>
          <Popover open={openShopSelector} onOpenChange={setOpenShopSelector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openShopSelector}
                className="w-full sm:w-[300px] justify-between"
                disabled={isLoading || availableShops.length === 0}
              >
                {selectedShopInfo?.name || "Chọn shop..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm shop..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy shop.</CommandEmpty>
                  <CommandGroup>
                    {availableShops.map((shop) => (
                      <CommandItem
                        key={shop.id}
                        value={shop.name}
                        onSelect={() => {
                          setSelectedShop(shop.id);
                          setOpenShopSelector(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedShop === shop.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {shop.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Shop Info */}
          {shopData.shopName && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>👤 {shopData.personnelName}</span>
              <span>👑 {shopData.leaderName}</span>
              <span>📅 {shopData.daysActive} ngày hoạt động</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu Shop"
          value={shopData.totalRevenue}
          icon={DollarSign}
          formatValue={formatCurrency}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Số đơn hàng"
          value={shopData.totalOrders}
          icon={ShoppingCart}
          formatValue={formatNumber}
          className="border-l-4 border-l-blue-500"
        />
        <StatCard
          title="Giá trị TB/Đơn"
          value={shopData.averageOrderValue}
          icon={TrendingUp}
          formatValue={formatCurrency}
          className="border-l-4 border-l-purple-500"
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={shopData.conversionRate}
          icon={Percent}
          formatValue={formatPercentage}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Lượt truy cập"
          value={shopData.totalVisits}
          icon={Eye}
          formatValue={formatNumber}
          className="border-l-4 border-l-cyan-500"
        />
        <StatCard
          title="Tổng Khách hàng"
          value={shopData.totalBuyers}
          icon={Users}
          formatValue={formatNumber}
          className="border-l-4 border-l-indigo-500"
        />
        <StatCard
          title="Khách hàng mới"
          value={shopData.newBuyers}
          icon={UserCheck}
          formatValue={formatNumber}
          className="border-l-4 border-l-green-400"
        />
        <StatCard
          title="Tỷ lệ quay lại"
          value={shopData.buyerReturnRate}
          icon={RotateCcw}
          formatValue={formatPercentage}
          className="border-l-4 border-l-yellow-500"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đơn hàng hủy
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(shopData.cancelledOrders)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu hủy: {formatCurrency(shopData.cancelledRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đơn hoàn trả
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(shopData.returnedOrders)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu hoàn: {formatCurrency(shopData.returnedRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khách hiện tại
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(shopData.existingBuyers)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Khách hàng quen
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hiệu suất Shop
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopData.daysActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ngày hoạt động/{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} ngày
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights for Selected Shop */}
      {selectedShop && shopReports.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">📊 Insights cho {shopData.shopName}</h3>
            <span className="text-sm text-muted-foreground">Phân tích chi tiết shop</span>
          </div>
          <QuickInsights reports={shopReports} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;