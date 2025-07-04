import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Users, MessageCircle, Bot, LineChart, BarChart as BarChartIcon } from 'lucide-react';
import { useChatStatistics, useDailyChatUsage, useTopUsersByMessages, useTopBotsByMessages } from '@/hooks/useChatDashboardStats';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';

const DashboardOverview: React.FC = () => {
  const today = startOfDay(new Date());
  const defaultDateRange = {
    from: subDays(today, 29),
    to: endOfDay(today),
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [quickFilter, setQuickFilter] = useState('last30days');
  const [selectedUserFilter, setSelectedUserFilter] = useState('all'); // 'all' or specific user ID
  const [selectedBotFilter, setSelectedBotFilter] = useState('all'); // 'all' or specific bot type

  const startDate = dateRange?.from ? startOfDay(dateRange.from) : subDays(today, 29);
  const endDate = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(today);

  const { data: stats, isLoading: statsLoading } = useChatStatistics(startDate, endDate);
  const { data: dailyUsage, isLoading: dailyUsageLoading } = useDailyChatUsage(startDate, endDate);
  const { data: topUsers, isLoading: topUsersLoading } = useTopUsersByMessages(startDate, endDate);
  const { data: topBots, isLoading: topBotsLoading } = useTopBotsByMessages(startDate, endDate);

  const handleQuickFilterChange = (value: string) => {
    setQuickFilter(value);
    const now = new Date();
    let fromDate: Date;
    let toDate: Date = endOfDay(now);

    switch (value) {
      case 'today':
        fromDate = startOfDay(now);
        break;
      case 'last7days':
        fromDate = subDays(now, 6);
        break;
      case 'last30days':
        fromDate = subDays(now, 29);
        break;
      case 'thismonth':
        fromDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case 'lastmonth':
        fromDate = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        toDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      default:
        fromDate = subDays(now, 29);
        break;
    }
    setDateRange({ from: fromDate, to: toDate });
  };

  const formattedDailyUsage = useMemo(() => {
    if (!dailyUsage) return [];
    const dataMap = new Map<string, number>();
    dailyUsage.forEach(item => {
      const dateKey = format(new Date(item.date), 'dd/MM', { locale: vi });
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + Number(item.message_count));
    });

    const result = Array.from(dataMap.entries()).map(([date, count]) => ({
      date,
      'Số tin nhắn': count,
    }));
    return result.sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());
  }, [dailyUsage]);

  const botTypeMap: { [key: string]: string } = {
    'strategy': 'Tư vấn AI',
    'seo': 'SEO Shopee',
    'general': 'Hỏi đáp chung',
  };

  const formattedTopBots = useMemo(() => {
    if (!topBots) return [];
    return topBots.map(bot => ({
      name: botTypeMap[bot.bot_type] || bot.bot_type,
      'Số tin nhắn': Number(bot.message_count),
    }));
  }, [topBots]);

  const formattedTopUsers = useMemo(() => {
    if (!topUsers) return [];
    return topUsers.map(user => ({
      name: user.user_name,
      'Số tin nhắn': Number(user.message_count),
    }));
  }, [topUsers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Thống kê số liệu AI Store</h2>
          <p className="text-gray-600 mt-2">Tổng quan về hoạt động của các chatbot và người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                  )
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Select value={quickFilter} onValueChange={handleQuickFilterChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc nhanh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="last7days">7 ngày qua</SelectItem>
              <SelectItem value="last30days">30 ngày qua</SelectItem>
              <SelectItem value="thismonth">Tháng này</SelectItem>
              <SelectItem value="lastmonth">Tháng trước</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* User and Bot filters can be added here if needed, but for now, let's keep it simple */}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng truy cập</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? 'Đang tải...' : stats?.[0]?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">Người dùng đã tương tác với bot</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tin nhắn Chat Pro</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? 'Đang tải...' : stats?.[0]?.total_strategy_messages || 0}</div>
            <p className="text-xs text-muted-foreground">Tin nhắn với bot Tư vấn AI</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt dùng bot</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? 'Đang tải...' : stats?.[0]?.total_messages || 0}</div>
            <p className="text-xs text-muted-foreground">Tổng tin nhắn từ tất cả các bot</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Thống kê số liệu của Chat Pro | AI Assistant | AI Marketing</CardTitle>
          <CardDescription>Phân tích chi tiết về lượt sử dụng các tính năng Chat Pro, AI Assistant, AI Marketing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Daily Usage Chart */}
          <div className="h-[300px]">
            <h3 className="text-lg font-semibold mb-4">Tổng số user dùng Chat Pro mỗi ngày</h3>
            {dailyUsageLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Đang tải biểu đồ...</div>
            ) : formattedDailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={formattedDailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={(tick) => tick} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Số tin nhắn" stroke="#8884d8" activeDot={{ r: 8 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu cho khoảng thời gian này.</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 10 Users */}
            <div className="h-[300px]">
              <h3 className="text-lg font-semibold mb-4">Top 10 user dùng Bot nhiều nhất</h3>
              {topUsersLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Đang tải biểu đồ...</div>
              ) : formattedTopUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={formattedTopUsers}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Số tin nhắn" fill="#82ca9d" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu người dùng.</div>
              )}
            </div>

            {/* Top 10 Bots */}
            <div className="h-[300px]">
              <h3 className="text-lg font-semibold mb-4">Top 10 Bot có lượng message nhiều nhất</h3>
              {topBotsLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Đang tải biểu đồ...</div>
              ) : formattedTopBots.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={formattedTopBots}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Số tin nhắn" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Không có dữ liệu bot.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;