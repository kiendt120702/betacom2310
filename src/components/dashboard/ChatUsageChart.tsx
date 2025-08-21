import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DailyChatUsage } from "@/hooks/useChatAnalytics";
import { MessageSquare } from "lucide-react";

interface ChatUsageChartProps {
  data: DailyChatUsage[];
  isLoading: boolean;
}

const ChatUsageChart: React.FC<ChatUsageChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Xu hướng tin nhắn hàng ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Xu hướng tin nhắn hàng ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          Không có dữ liệu tin nhắn để hiển thị.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Xu hướng tin nhắn hàng ngày
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: vi })}
            />
            <YAxis
              tickFormatter={(value) => value.toLocaleString('vi-VN')}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString('vi-VN')} tin nhắn`, "Số tin nhắn"]}
              labelFormatter={(label) => format(new Date(label), "dd/MM/yyyy", { locale: vi })}
            />
            <Line
              type="monotone"
              dataKey="message_count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChatUsageChart;