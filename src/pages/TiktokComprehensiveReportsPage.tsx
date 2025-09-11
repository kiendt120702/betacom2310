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

const TiktokComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader,
    selectedPersonnel,
    debouncedSearchTerm,
    sortConfig: null,
  });

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
              <Popover
                open={openLeaderSelector}
                onOpenChange={setOpenLeaderSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLeaderSelector}
                    className="w-full sm:w-[240px] justify-between"
                    disabled={leaders.length === 0}>
                    {leaders.length === 0
                      ? "Không có Leader"
                      : selectedLeader !== "all"
                      ? leaders.find((leader) => leader.id === selectedLeader)
                          ?.name
                      : "Tất cả Leader"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm leader..." />
                    <CommandList>
                      <CommandEmpty>
                        {leaders.length === 0
                          ? "Không có leader nào."
                          : "Không tìm thấy leader."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedLeader("all");
                            setOpenLeaderSelector(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLeader === "all"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Tất cả Leader
                        </CommandItem>
                        {leaders.map((leader) => (
                          <CommandItem
                            key={leader.id}
                            value={leader.name}
                            onSelect={() => {
                              setSelectedLeader(leader.id);
                              setOpenLeaderSelector(false);
                            }}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeader === leader.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {leader.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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