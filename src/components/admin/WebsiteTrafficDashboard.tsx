import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Eye, Users, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import KpiCard from "@/components/dashboard/KpiCard";
import WebsiteUsageChart from "@/components/dashboard/WebsiteUsageChart";
import TopPagesUsersTable from "@/components/dashboard/TopPagesUsersTable";
import { useWebsiteAnalytics } from "@/hooks/useWebsiteAnalytics";

const WebsiteTrafficDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { dailyViews, topPages, topUsers, isLoading, error } = useWebsiteAnalytics({
    startDate: dateRange?.from || addDays(new Date(), -30),
    endDate: dateRange?.to || new Date(),
  });

  const totalViews = React.useMemo(() => {
    return dailyViews?.reduce((sum, day) => sum + day.view_count, 0) || 0;
  }, [dailyViews]);

  const uniqueUsers = React.useMemo(() => {
    return topUsers?.length || 0;
  }, [topUsers]);

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
              value={uniqueUsers.toLocaleString('vi-VN')}
              icon={Users}
              description="Số người dùng đã truy cập"
            />
          </div>

          <WebsiteUsageChart data={dailyViews || []} isLoading={isLoading} />
          <TopPagesUsersTable topPages={topPages || []} topUsers={topUsers || []} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default WebsiteTrafficDashboard;