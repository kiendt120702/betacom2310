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
  Legend,
} from "recharts";
import { format } from "date-fns";

interface RevenueChartProps {
  data: { date: string; revenue: number; traffic?: number; conversion_rate?: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biểu đồ chỉ số theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date.replace(/-/g, "/")), "dd/MM")}
            />
            <YAxis yAxisId="left" orientation="left"
              tickFormatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <YAxis yAxisId="right" orientation="right"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Doanh thu') {
                  return [new Intl.NumberFormat("vi-VN").format(value), name];
                } else if (name === 'Traffic') {
                  return [new Intl.NumberFormat("vi-VN").format(value), name];
                } else if (name === 'Tỷ lệ CĐ') {
                  return [`${value.toFixed(2)}%`, name];
                }
                return [value, name];
              }}
              labelFormatter={(label) => format(new Date(label.replace(/-/g, "/")), "dd/MM/yyyy")}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Doanh thu"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="traffic"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Traffic"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversion_rate"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Tỷ lệ CĐ"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;