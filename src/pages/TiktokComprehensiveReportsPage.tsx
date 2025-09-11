import React, { useMemo, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTiktokComprehensiveReportData } from "@/hooks/useTiktokComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";
import { Calendar, BarChart3, Store, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
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
import TiktokReportUpload from '@/components/admin/TiktokReportUpload';
import TiktokComprehensiveReportTable from '@/components/tiktok-shops/TiktokComprehensiveReportTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiktokCancelledRevenueUpload from '@/components/admin/TiktokCancelledRevenueUpload';

const TiktokComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel,
    debouncedSearchTerm,
    sortConfig: null,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Báo Cáo TikTok</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly_report">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly_report">Báo cáo tháng</TabsTrigger>
              <TabsTrigger value="cancelled_revenue">Doanh số hủy</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly_report" className="mt-4">
              <TiktokReportUpload />
            </TabsContent>
            <TabsContent value="cancelled_revenue" className="mt-4">
              <TiktokCancelledRevenueUpload />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">
                Báo Cáo Tổng Hợp Theo Shop
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
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
                {/* Skeleton loading for better UX */}
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
    </div>
  );
};

export default TiktokComprehensiveReportsPage;