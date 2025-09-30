import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RevenueChartProps {
  data: { date: string; revenue: number; traffic?: number; conversion_rate?: number }[];
}

const chartConfig = {
  revenue: {
    label: "Doanh thu (VND)",
    color: "hsl(var(--chart-1))",
  },
  traffic: {
    label: "Traffic",
    color: "hsl(var(--chart-2))",
  },
  conversion_rate: {
    label: "Tỷ lệ CĐ (%)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biểu đồ chỉ số theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value.replace(/-/g, "/")), "dd/MM", { locale: vi })}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => format(new Date(label.replace(/-/g, "/")), "dd/MM/yyyy", { locale: vi })}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return new Intl.NumberFormat("vi-VN").format(value as number);
                    }
                    if (name === 'traffic') {
                      return (value as number).toLocaleString('vi-VN');
                    }
                    if (name === 'conversion_rate') {
                      return `${(value as number).toFixed(2)}%`;
                    }
                    return value;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              yAxisId="left"
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="left"
              dataKey="traffic"
              type="monotone"
              stroke="var(--color-traffic)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              dataKey="conversion_rate"
              type="monotone"
              stroke="var(--color-conversion_rate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;