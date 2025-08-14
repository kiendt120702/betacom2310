import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";

interface ComprehensiveReportsTableProps {
  reports: ComprehensiveReport[];
  onRefresh?: () => void;
}

const ComprehensiveReportsTable: React.FC<ComprehensiveReportsTableProps> = ({
  reports,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Filter reports based on search and date range
  const filteredReports = reports.filter((report) => {
    const matchesSearch = !searchTerm || 
      report.report_date.toLowerCase().includes(searchTerm.toLowerCase());

    const reportDate = new Date(report.report_date);
    const matchesDateFrom = !dateFrom || reportDate >= dateFrom;
    const matchesDateTo = !dateTo || reportDate <= dateTo;

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chưa có dữ liệu báo cáo nào</p>
        <p className="text-sm text-muted-foreground mt-2">
          Sử dụng nút "Import Excel" để thêm dữ liệu báo cáo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo ngày..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Từ ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "dd/MM/yyyy") : "Đến ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateFrom(undefined);
              setDateTo(undefined);
              setSearchTerm("");
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Xóa lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold min-w-[100px]">Ngày</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">Tổng doanh số</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Tổng đơn hàng</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">DS TB/đơn</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Click SP</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Lượt truy cập</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Tỷ lệ CV</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Đơn hủy</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">DS đơn hủy</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Đơn hoàn</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">DS đơn hoàn</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Tổng người mua</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Người mua mới</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">Người mua hiện tại</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">Người mua tiềm năng</TableHead>
              <TableHead className="font-semibold text-right min-w-[120px]">Tỷ lệ quay lại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatDate(report.report_date)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatCurrency(report.total_revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(report.total_orders)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.average_order_value)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(report.product_clicks)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(report.total_visits)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">
                    {formatPercentage(report.conversion_rate)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatNumber(report.cancelled_orders)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(report.cancelled_revenue)}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatNumber(report.returned_orders)}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatCurrency(report.returned_revenue)}
                </TableCell>
                <TableCell className="text-right text-blue-600">
                  {formatNumber(report.total_buyers)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatNumber(report.new_buyers)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(report.existing_buyers)}
                </TableCell>
                <TableCell className="text-right text-purple-600">
                  {formatNumber(report.potential_buyers)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">
                    {formatPercentage(report.buyer_return_rate)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredReports.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Tổng kết ({filteredReports.length} ngày)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tổng doanh số:</span>
              <p className="font-semibold text-green-600">
                {formatCurrency(filteredReports.reduce((sum, r) => sum + r.total_revenue, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tổng đơn hàng:</span>
              <p className="font-semibold">
                {formatNumber(filteredReports.reduce((sum, r) => sum + r.total_orders, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tổng người mua:</span>
              <p className="font-semibold text-blue-600">
                {formatNumber(filteredReports.reduce((sum, r) => sum + r.total_buyers, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tỷ lệ CV trung bình:</span>
              <p className="font-semibold">
                {formatPercentage(
                  filteredReports.reduce((sum, r) => sum + r.conversion_rate, 0) / filteredReports.length
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportsTable;