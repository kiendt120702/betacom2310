import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, MessageSquare, Users, Bot, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import KpiCard from "@/components/dashboard/KpiCard";
import ChatUsageChart from "@/components/dashboard/ChatUsageChart";
import TopUsersBotsTable from "@/components/dashboard/TopUsersBotsTable";
import { useChatAnalytics } from "@/hooks/useChatAnalytics";
import { vi } from "date-fns/locale";

const ChatTrafficDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { chatStats, dailyUsage, topBots, topUsers, isLoading, error } = useChatAnalytics({
    startDate: dateRange?.from || addDays(new Date(), -30),
    endDate: dateRange?.to || new Date(),
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
        <h1 className="text-3xl font-bold text-foreground">Thống kê Traffic Chat</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi hoạt động chat của người dùng và bot trong hệ thống.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Chọn khoảng thời gian
          </CardTitle>
          <CardDescription>
            Chọn ngày bắt đầu và kết thúc để xem dữ liệu thống kê.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DatePickerWithRange date={dateRange} onDateChange={(selectedDate: DateRange | undefined) => setDateRange(selectedDate)} />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Tổng số người dùng"
              value={chatStats?.total_users.toLocaleString('vi-VN') || "0"}
              icon={Users}
              description="Người dùng đã gửi tin nhắn"
            />
            <KpiCard
              title="Tổng số tin nhắn"
              value={chatStats?.total_messages.toLocaleString('vi-VN') || "0"}
              icon={MessageSquare}
              description="Tổng tin nhắn trong khoảng thời gian"
            />
            <KpiCard
              title="Tin nhắn SEO"
              value={chatStats?.total_seo_messages.toLocaleString('vi-VN') || "0"}
              icon={Bot}
              description="Tin nhắn gửi bot SEO"
            />
            <KpiCard
              title="Tin nhắn General"
              value={chatStats?.total_general_messages.toLocaleString('vi-VN') || "0"}
              icon={Bot}
              description="Tin nhắn gửi bot General"
            />
          </div>

          {/* Daily Usage Chart */}
          <ChatUsageChart data={dailyUsage || []} isLoading={isLoading} />

          {/* Top Users & Bots Table */}
          <TopUsersBotsTable topUsers={topUsers || []} topBots={topBots || []} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default ChatTrafficDashboard;