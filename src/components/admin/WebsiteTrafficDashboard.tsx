import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Eye, Users, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import KpiCard from "@/components/dashboard/KpiCard";
import WebsiteUsageChart from "@/components/dashboard/WebsiteUsageChart";
import TopPagesUsersTable from "@/components/dashboard/TopPagesUsersTable";
import { useWebsiteAnalytics } from "@/hooks/useWebsiteAnalytics";
import { usePagination } from "@/hooks/usePagination";

const WebsiteTrafficDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const userItemsPerPage = 10;

  const { dailyViews, topPages, topUsers, topUsersTotalCount, isLoading, error } = useWebsiteAnalytics({
    startDate: dateRange?.from || addDays(new Date(), -30),
    endDate: dateRange?.to || new Date(),
    userPage: userCurrentPage,
    userPageSize: userItemsPerPage,
  });

  const totalViews = React.useMemo(() => {
    return dailyViews?.reduce((sum, day) => sum + day.view_count, 0) || 0;
  }, [dailyViews]);

  const userTotalPages = topUsersTotalCount ? Math.ceil(topUsersTotalCount / userItemsPerPage) : 0;

  const userPaginationRange = usePagination({
    currentPage: userCurrentPage,
    totalCount: topUsersTotalCount || 0,
    pageSize: userItemsPerPage,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Lỗi tải dữ liệu: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thống kê Traffic Website</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi hoạt động truy cập trang của người dùng trong hệ thống.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Chọn khoảng thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Tổng lượt xem"
              value={totalViews.toLocaleString('vi-VN')}
              icon={Eye}
              description="Tổng số lượt xem trang"
            />
            <KpiCard
              title="Người dùng hoạt động"
              value={(topUsersTotalCount || 0).toLocaleString('vi-VN')}
              icon={Users}
              description="Số người dùng đã truy cập"
            />
          </div>

          <WebsiteUsageChart data={dailyViews || []} isLoading={isLoading} />
          <TopPagesUsersTable
            topPages={topPages || []}
            topUsers={topUsers || []}
            isLoading={isLoading}
            userPagination={{
              currentPage: userCurrentPage,
              totalPages: userTotalPages,
              onPageChange: setUserCurrentPage,
              paginationRange: userPaginationRange,
              totalCount: topUsersTotalCount || 0,
              pageSize: userItemsPerPage,
            }}
          />
        </>
      )}
    </div>
  );
};

export default WebsiteTrafficDashboard;