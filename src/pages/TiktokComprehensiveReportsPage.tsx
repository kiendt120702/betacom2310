import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTiktokComprehensiveReports } from "@/hooks/useTiktokComprehensiveReports";
import { Calendar, BarChart3, Store } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { generateMonthOptions } from "@/utils/revenueUtils";
import { useTiktokShops } from "@/hooks/useTiktokComprehensiveReportData";
import TiktokReportUpload from '@/components/admin/TiktokReportUpload';
import TiktokReportTable from '@/components/tiktok-shops/TiktokReportTable';

const TiktokComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();
  const { data: reportsData, isLoading: reportsLoading } = useTiktokComprehensiveReports(0, 10000);
  const reports = reportsData?.data || [];

  const isLoading = shopsLoading || reportsLoading;

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter(report => {
      const reportMonth = format(new Date(report.report_date), 'yyyy-MM');
      const matchesMonth = reportMonth === selectedMonth;
      const matchesShop = selectedShop === 'all' || report.shop_id === selectedShop;
      return matchesMonth && matchesShop;
    });
  }, [reports, selectedMonth, selectedShop]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Báo Cáo Tổng Hợp TikTok - {format(new Date(selectedMonth + '-02'), 'MMMM yyyy', { locale: vi })}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Báo Cáo TikTok</CardTitle>
        </CardHeader>
        <CardContent>
          <TiktokReportUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Chi tiết báo cáo
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn shop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả shop</SelectItem>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <TiktokReportTable reports={filteredReports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokComprehensiveReportsPage;